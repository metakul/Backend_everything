/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response, NextFunction } from "express";
import bcrypt from 'bcrypt';
import { ErrorEnum } from "../../DataTypes/enums/Error.js";
import { logWithMessageAndStep } from "../../Helpers/Logger/logger.js";
import winston from 'winston';
import { generateToken } from "../../Utils/scripts/tokenUtils.js";
import { LoginUserRequest } from "../../Middleware/UserExist.js";

export const login = async (
    req: LoginUserRequest,
    res: Response,
    next: NextFunction
) => {
    const childLogger = (req as any).childLogger as winston.Logger;

    if (!childLogger) {
        console.error('Child Logger not found on request object');
        return next(new Error('Internal Server Error'));
    }

    const { password } = req.body;
    const user = req.user;

    try {
        if (user) {
            logWithMessageAndStep(childLogger, "Step 1", "Reading password from Body", "login", JSON.stringify(req.body), "info");

            // Compare passwords
            const isPasswordMatch = await bcrypt.compare(password, user.password);
            logWithMessageAndStep(childLogger, "Step 2", "Comparing passwords", "login", JSON.stringify(isPasswordMatch), "debug");

            if (!isPasswordMatch) {
                logWithMessageAndStep(childLogger, "Error Step", "Password mismatch", "login", user.email, "warn");
                throw ErrorEnum.UserPasswordError(user.email);
            }

            // todo get userInfo from mongodb
            const token = generateToken(user);

            logWithMessageAndStep(childLogger, "Step 3", "JWT token generated", "login", JSON.stringify(user.email), "debug");

            res.status(200).json({
                message: 'Login successful',
                data: {
                    name: user.name,
                    token,
                    email: user.email,
                    category: user.category,
                },
                statusCode: 200
            });
        } else {
            logWithMessageAndStep(childLogger, "Error Step", "User validation failed", "login", "User not found", "error");
            throw ErrorEnum.InternalserverError("Error validating User");
        }
    } catch (error) {
        logWithMessageAndStep(childLogger, "Error Step", "Error during login process", "login", JSON.stringify(error), "error");
        return next(error);
    }
};
