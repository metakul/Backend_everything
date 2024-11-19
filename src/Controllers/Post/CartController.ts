import { Response, NextFunction } from "express";
import { prisma } from "../../db/client.js";
import { LoginUserRequest } from "../../Middleware/UserExist.js";
import { ErrorEnum } from "../../DataTypes/enums/Error.js";
import { InputJsonValue } from "@prisma/client/runtime/library.js";

/**
 * Add an item to the cart
 * @param item
 */
export const addToCart = async (
    req: LoginUserRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Check if the user is authenticated
      const user = req.user;
      if (!user) {
        throw ErrorEnum.InternalserverError("User not authenticated");
      }
  
      const { email } = user; // Extract user email
      const { id, name, quantity, image } = req.body; // Extract cart item details
  
      // Validate the fields
      if (!id || !name || !quantity || !image) {
        return res.status(400).json({
          message: "Missing required item fields",
          statusCode: 400,
        });
      }
  
      // Ensure quantity is greater than 0
      if (quantity <= 0) {
        return res.status(400).json({
          message: "Quantity must be greater than zero",
          statusCode: 400,
        });
      }
  
      // Fetch the existing cartItems
      const existingUser = await prisma.wiwusers.findUnique({
        where: { email },
        select: { cartItems: true },
      });
  
      if (!existingUser) {
        return res.status(404).json({ message: "User not found", statusCode: 404 });
      }
      const existingCartItems = (existingUser.cartItems || []) as InputJsonValue[];

      // Create a new item
      const newItem: InputJsonValue = { id, name, quantity, image };
  
      // Update the cartItems array
      const updatedCartItems: InputJsonValue[] = [...existingCartItems, newItem];
  
      // Update the user's cartItems in the database
      const updatedUser = await prisma.wiwusers.update({
        where: { email },
        data: {
          cartItems: updatedCartItems, // Replace with the updated array
        },
      });
  
      // Respond with success
      return res.status(200).json({
        message: "Item added to cart successfully",
        data: updatedUser.cartItems,
        statusCode: 200,
      });
    } catch (error) {
      console.error("Error adding item to cart:", error);
      return next(error);
    }
  };
  


/**
 * Fetch the user's cart
 */
export const fetchCart = async (
    req: LoginUserRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = req.user;

        if (!user) {
            throw ErrorEnum.InternalserverError("User not authenticated");
        }

        const { email } = user;

        // Fetch user's cart
        const userData = await prisma.wiwusers.findUnique({
            where: { email },
            select: { cartItems: true }, // Assuming `cartItems` is an array field
        });

        if (!userData || !userData.cartItems) {
            return res.status(404).json({
                message: "Cart is empty",
                data: [],
                statusCode: 404,
            });
        }

        return res.status(200).json({
            message: "Cart fetched successfully",
            data: userData.cartItems,
            statusCode: 200,
        });
    } catch (error) {
        return next(error);
    }
};
