import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../db/client.js';
import { ErrorEnum } from '../DataTypes/enums/Error.js';
import config from '../config.js';
import { UserCategory } from '../DataTypes/enums/IUserEnums.js';
import winston, { child } from 'winston';
import { logWithMessageAndStep } from '../Helpers/Logger/logger.js';
import { RequestWithUser } from './checkJwt.js';

const JWT_SECRET = config.JWT_SECRET

export const IfSuperAdmin = async (
    req: RequestWithUser,
    _res: Response,
    next: NextFunction
) => {
    let token: string | undefined;
    let category: string | undefined;

    const childLogger = (req as any).childLogger as winston.Logger;

    if (!childLogger) {
        console.error('Child Logger not found on request object');
        return next(new Error('Internal Server Error'));
    }

    try {
        const authHeader = req.headers.authorization;
        logWithMessageAndStep(childLogger, "Middleware step 1", "Checking If auth header is present", "IfSuperAdmin", JSON.stringify(authHeader), "silly")
        if (!authHeader) {
            logWithMessageAndStep(childLogger, "Error Middleware step ", "AuthHeader Not Present", "IfSuperAdmin", JSON.stringify(authHeader), "warn")

            throw ErrorEnum.MissingAuth();
        }

        token = authHeader.split(' ')[1];

        logWithMessageAndStep(childLogger, "Middleware step 2", "Checking If auth header contains token", "IfSuperAdmin", JSON.stringify(token), "silly")


        if (!token) {
            logWithMessageAndStep(childLogger, "Error Middleware step", "Token Not Present", "IfSuperAdmin", JSON.stringify(token), "warn")

            throw ErrorEnum.MissingJwt();
        }


        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET as string) as { category: string | undefined };
            logWithMessageAndStep(childLogger, "Middleware step 3", "Decoded Token ", "IfSuperAdmin", JSON.stringify(decoded), "debug")
        } catch (err) {
            logWithMessageAndStep(childLogger, "Error Middleware step ", "Error Decoding Token", "IfSuperAdmin", JSON.stringify(err), "error")

            throw ErrorEnum.InvalidJwt(err)
        }
        category = decoded.category;

        logWithMessageAndStep(childLogger, "Middleware step 4", "Checking Admin Category via decoded Info", "IfSuperAdmin", JSON.stringify(category), "debug")

        if (category !== UserCategory.SUPER_ADMIN) {
            logWithMessageAndStep(childLogger, "Error Middleware step", "Error In Verifying token category type", "IfSuperAdmin", JSON.stringify(category), "warn")

            throw ErrorEnum.PermissionDeniedError(UserCategory.SUPER_ADMIN);
        }


        const user = await prisma.superAdmin.findUnique({
            where: { category: category }
        });

        if (!user) {
            logWithMessageAndStep(childLogger, "Error Middleware step", "Decoded Admin User not found in DB", "IfSuperAdmin", JSON.stringify(user), "error")

            throw ErrorEnum.PermissionDeniedError(UserCategory.SUPER_ADMIN);
        }
        logWithMessageAndStep(childLogger, "Middleware step 5", "Get user from DB and send the user to handle API", "IfSuperAdmin", JSON.stringify(user), "debug")

        next();
    } catch (error) {
        next(error);
    }
};
