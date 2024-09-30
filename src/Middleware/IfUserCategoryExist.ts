import { Response, NextFunction } from 'express';
import { IUserWithDid } from '../DataTypes/interfaces/IUser.js';
import { ErrorEnum } from '../DataTypes/enums/Error.js';
import { UserCategory } from '../DataTypes/enums/IUserEnums.js';
import { RequestWithUser } from './checkJwt.js';
import winston, { child } from 'winston';
import { logWithMessageAndStep } from '../Helpers/Logger/logger.js';


export const checkUserCategoryExists = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
) => {
    const user = req.user;
    const email = req.email;

    const childLogger = (req as any).childLogger as winston.Logger;

    if (!childLogger) {
        console.error('Child Logger not found on request object');
        return next(new Error('Internal Server Error'));
    }

    try {
        logWithMessageAndStep(childLogger, "Check Category Step 1", "Check is user and email received", "checkUserCategoryExists", JSON.stringify({
            user: JSON.stringify(user),
            email: JSON.stringify(email)
        }), "info")
        if (user && user.category === UserCategory.Issuer || UserCategory.Holder || UserCategory.Verifier) {
            logWithMessageAndStep(childLogger, "Check Category Step 2", "Category varified to handle next API", "checkUserCategoryExists", JSON.stringify(user?.category), "debug")

            req.user = user as IUserWithDid;
            next();
        }
        else {
            logWithMessageAndStep(childLogger, "Error Check Category Step", "Error verifying user Category", "checkUserCategoryExists", JSON.stringify(email), "error")
            throw ErrorEnum.InvalidAccountCategory(email)
        }
    } catch (error) {
        next(error);
    }
};
