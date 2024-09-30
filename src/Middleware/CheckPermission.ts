import { Response, NextFunction } from 'express';
import { RequestWithUser } from './checkJwt.js';
import { ErrorEnum, PermissionError } from '../DataTypes/enums/Error.js';
import winston from 'winston';
import { logWithMessageAndStep } from '../Helpers/Logger/logger.js';

const CheckPermission = (requiredPermission: string) => async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
) => {
    const user = req.user;
    const childLogger = (req as any).childLogger as winston.Logger;

    if (!childLogger) {
        console.error('Child Logger not found on request object');
        return next(new Error('Internal Server Error'));
    }

    try {
        logWithMessageAndStep(childLogger, "Middleware step 1", "Checking if user exists", "CheckPermission", JSON.stringify(user), "silly");

        if (user) {
            const userPermissions = user.permissions || [];
            logWithMessageAndStep(childLogger, "Middleware step 2", "Retrieved user permissions", "CheckPermission", JSON.stringify(userPermissions), "silly");

            console.log(userPermissions);

            const hasPermission = userPermissions.includes(requiredPermission);
            logWithMessageAndStep(childLogger, "Middleware step 3", "Checking if user has required permission", "CheckPermission", `Required: ${requiredPermission}, Has: ${hasPermission}`, "silly");

            if (!hasPermission) {
                logWithMessageAndStep(childLogger, "Error Middleware step", "User does not have required permission", "CheckPermission", requiredPermission, "warn");
                throw PermissionError.NotEnoughPermission(requiredPermission);
            }
            logWithMessageAndStep(childLogger, "Middleware step 4", "User has required permission", "CheckPermission", requiredPermission, "debug");
            next();
        } else {
            logWithMessageAndStep(childLogger, "Error Middleware step", "User not found on request object", "CheckPermission", "", "error");
            throw PermissionError.UnknownUserError();
        }
    } catch (error) {
        logWithMessageAndStep(childLogger, "Error Middleware step", "Caught error in permission check", "CheckPermission", JSON.stringify(error), "error");
        next(error);
    }
};

export default CheckPermission;
