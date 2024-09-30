import { Response, NextFunction } from "express";
import { prisma } from "../../db/client.js";
import { ErrorEnum } from "../../DataTypes/enums/Error.js";
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

        if (user) {
            const { email } = user

            const userInfo = await prisma.users.findUnique({
                where: { email: email },
                select: {
                    id: true,
                    phoneNumber: true,
                    category: true,
                    address: true,
                    email: true,
                    didCreated: true,
                },
            });

            if (!userInfo) {
                throw ErrorEnum.UserNotFoundwithEmail(email);
            }

            return res.status(200).json({
                message: "Profile Fetched SuccessFully",
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
