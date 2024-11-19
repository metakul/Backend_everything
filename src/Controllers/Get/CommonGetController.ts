import { Response, NextFunction } from "express";
import { prisma } from "../../db/client.js";
import { ErrorEnum, PaymentError } from "../../DataTypes/enums/Error.js";
import { LoginUserRequest } from "../../Middleware/UserExist.js";

/**
 * Get user Profile 
 * @param email
 */
export const profile = async (
    req: LoginUserRequest,
    res: Response,
    next: NextFunction
) => {

    try {
        const user = req.user

        console.log(user);
        

        if (user) {
            const { email } = user;
        
            // First attempt to find user in the 'users' table
            let userInfo = await prisma.users.findUnique({
                where: { email: email },
                select: {
                    id: true,
                    phoneNumber: true,
                    category: true,
                    address: true,
                    email: true,
                },
            });
        
            // If no user found in 'users' table, search in 'wiwusers' table
            if (!userInfo) {
                userInfo = await prisma.wiwusers.findUnique({
                    where: { email: email },
                    select: {
                        id: true,
                        phoneNumber: true,
                        category: true,
                        address: true,
                        email: true,
                    },
                });
            }
        
            // If still no user info found, throw an error
            if (!userInfo) {
                throw ErrorEnum.UserNotFoundwithEmail(email);
            }
        
            // Return user info as response
            return res.status(200).json({
                message: "Profile Fetched Successfully",
                data: userInfo,
                statusCode: 200
            });
        }
        
        else {
            throw ErrorEnum.InternalserverError("Error validating User")
        }
    } catch (error) {
        return next(error)
    }
};

/**
 * Add Razorpay Payment ID
 * @param paymentId
 */
export const addPaymentId = async (
    req: LoginUserRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = req.user;

        if (!user) {
            throw ErrorEnum.InternalserverError("Error validating User");
        }

        const { email } = user;
        const { paymentId } = req.body;

        if (!paymentId) {
            throw PaymentError.InvalidPaymentDetails();
        }

        const updatedUser = await prisma.wiwusers.update({
            where: { email },
            data: {
                razorpayPayments: {
                    push: paymentId, // Assuming `razorpayPayments` is an array field in your database schema
                },
            },
        });

        return res.status(200).json({
            message: "Payment ID added successfully",
            data: updatedUser,
            statusCode: 200,
        });
    } catch (error) {
        return next(error);
    }
};


/**
 * Get Razorpay Payment IDs
 */
export const getPaymentIds = async (
    req: LoginUserRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = req.user;

        if (!user) {
            throw ErrorEnum.InternalserverError("Error validating User");
        }

        const phoneNumber = (user as any).phoneNumber;

        const userInfo = await prisma.wiwusers.findUnique({
            where: {phoneNumber: phoneNumber },
            select: {
                razorpayPayments: true, // Fetch only the Razorpay payments array
            },
        });


        return res.status(200).json({
            message: "Razorpay Payment IDs fetched successfully",
            data: userInfo,
            statusCode: 200,
        });
    } catch (error) {
        return next(error);
    }
};