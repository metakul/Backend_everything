/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from "express";
import { prisma } from "../../db/client.js";
import { ErrorEnum } from "../../DataTypes/enums/Error.js";
import { accountStatus } from "../../DataTypes/enums/IUserEnums.js";

/**
 * Get org user list or count or both
 * @param status
 * @param type
 */
export const orgList = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { status, type } = req.query;

    try {
        // Validate the status
        if (status !== 'all' && !Object.values(accountStatus).includes(status as accountStatus)) {
            throw ErrorEnum.UserNotFoundwithStatus(status as accountStatus);
        }

        let users, userCount;
        const whereClause = status === 'all' ? {} : { accountStatus: status as accountStatus };

        if (type === 'list' || type === 'both') {
            users = await prisma.users.findMany({
                where: whereClause,
                select: {
                    id: true,
                    email: true,
                    name: true,
                    phoneNumber: true,
                    category: true,
                    accountStatus: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });

            if (!users || users.length === 0) {
                throw ErrorEnum.NoUsersFound(status as accountStatus);
            }
        }

        if (type === 'count' || type === 'both') {
            userCount = await prisma.users.count({
                where: whereClause,
            });

            if (userCount === 0) {
                throw ErrorEnum.NoUsersFound(status as accountStatus);
            }
        }

        const response: any = {
            message: `${status} Org Users fetched Successfully`,
            statusCode: 200,
        };

        if (type === 'list' || type === 'both') {
            response.data = users;
        }
        if (type === 'count' || type === 'both') {
            response.count = userCount;
        }

        return res.status(200).json(response);
    } catch (error) {
        return next(error);
    }
};

