import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ErrorEnum } from '../DataTypes/enums/Error.js';
import config from '../config.js';
import { logWithMessageAndStep } from '../Helpers/Logger/logger.js';
import winston from 'winston';
import { IUser } from '../DataTypes/interfaces/IUser.js';

const JWT_SECRET = config.JWT_SECRET;

export interface RequestWithUser extends Request {
    user?: IUser;
    email?: string;
    headers:any;
    params:any;
    body:any;
    file?:any;
}

export default async function checkJwt(
    req: RequestWithUser,
    _res: Response,
    next: NextFunction
) {
    const childLogger = (req as any).childLogger as winston.Logger;

    if (!childLogger) {
        console.error('Child Logger not found on request object');
        return next(new Error('Internal Server Error'));
    }

    try {
        const authHeader = req.headers.authorization;
        logWithMessageAndStep(childLogger, "Middleware step 1", "Checking if auth header is present", "checkJwt", JSON.stringify(authHeader), "silly");

        if (!authHeader) {
            logWithMessageAndStep(childLogger, "Error Middleware step", "AuthHeader not present", "checkJwt", JSON.stringify(authHeader), "warn");
            throw ErrorEnum.MissingAuth();
        }

        const token = authHeader.split(' ')[1];
        logWithMessageAndStep(childLogger, "Middleware step 2", "Checking if auth header contains token", "checkJwt", JSON.stringify(token), "silly");

        if (!token) {
            logWithMessageAndStep(childLogger, "Error Middleware step", "Token not present", "checkJwt", JSON.stringify(token), "warn");
            throw ErrorEnum.MissingJwt();
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET as string) as { user?: IUser };
            logWithMessageAndStep(childLogger, "Middleware step 3", "Decoded Token", "checkJwt", JSON.stringify(decoded), "debug");
            req.user = decoded as unknown as IUser;
            next();
        } catch (err) {
            logWithMessageAndStep(childLogger, "Error Middleware step", "Error decoding token", "checkJwt", JSON.stringify(err), "error");
            throw ErrorEnum.InvalidJwt(err);
        }
    } catch (error) {
        console.log(error);
        
        next(error);
    }
};
