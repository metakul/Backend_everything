import { Response, NextFunction } from "express";
import { prisma } from "../../db/client.js";
import { LoginUserRequest } from "../../Middleware/UserExist.js";
import { ErrorEnum } from "../../DataTypes/enums/Error.js";
import { InputJsonValue } from "@prisma/client/runtime/library.js";

/**
 * Add an item to the cart, increasing quantity by one if already exists
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
    const { id, name, size,quantity } = req.body; // Extract cart item details

    // Validate the fields
    if (!id || !name || !quantity) {
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

    const existingCartItems = (existingUser.cartItems || []) as any[];

    // Check if the item already exists in the cart
    const itemIndex = existingCartItems.findIndex((item: any) => item.id === id);
    if (itemIndex !== -1) {
      // If the item exists, increase the quantity by one
      existingCartItems[itemIndex].quantity += 1;
    } else {
      // If the item doesn't exist, add it as a new item
      const newItem: InputJsonValue = { id, name, quantity,size };
      existingCartItems.push(newItem);
    }

    // Update the user's cartItems in the database
    const updatedUser = await prisma.wiwusers.update({
      where: { email },
      data: {
        cartItems: existingCartItems, // Replace with the updated array
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
 * Remove an item from the cart
 * @param itemId
 */
export const removeFromCart = async (
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
    const { id } = req.body; // Extract item id to be removed

    // Validate the fields
    if (!id) {
      return res.status(400).json({
        message: "Missing required item id",
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

    let existingCartItems = (existingUser.cartItems || []) as InputJsonValue[];

    // Find the item to remove
    const itemIndex = existingCartItems.findIndex((item: any) => item.id === id);
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart", statusCode: 404 });
    }

    // Remove the item from the cart
    existingCartItems = existingCartItems.filter((item: any) => item.id !== id);

    // Update the user's cartItems in the database
    const updatedUser = await prisma.wiwusers.update({
      where: { email },
      data: {
        cartItems: existingCartItems, // Replace with the updated array
      },
    });

    // Respond with success
    return res.status(200).json({
      message: "Item removed from cart successfully",
      data: updatedUser.cartItems,
      statusCode: 200,
    });
  } catch (error) {
    console.error("Error removing item from cart:", error);
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


/**
 * Empty the user's cart
 * @dev
 */
export const emptyCart = async (
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

    // Fetch the existing cartItems
    const existingUser = await prisma.wiwusers.findUnique({
      where: { email },
      select: { cartItems: true },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found", statusCode: 404 });
    }

    // Empty the user's cart by setting cartItems to an empty array
    const updatedUser = await prisma.wiwusers.update({
      where: { email },
      data: {
        cartItems: [], // Set the cartItems to an empty array
      },
    });

    // Respond with success
    return res.status(200).json({
      message: "Cart emptied successfully",
      data: updatedUser.cartItems,
      statusCode: 200,
    });
  } catch (error) {
    console.error("Error emptying cart:", error);
    return next(error);
  }
};
