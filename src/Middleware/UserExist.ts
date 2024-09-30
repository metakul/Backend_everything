/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response, NextFunction, Request } from 'express';
import { prisma } from '../db/client.js';
import { IsystemAdmin, IUserWithDid } from '../DataTypes/interfaces/IUser.js';
import { ErrorEnum } from '../DataTypes/enums/Error.js';
import winston from 'winston';
import { logWithMessageAndStep } from '../Helpers/Logger/logger.js';
export interface LoginUserRequest extends Request {
  user?: IUserWithDid | IsystemAdmin;
  email?: string
}
export const checkUserExists = async (
  req: LoginUserRequest,
  res: Response,
  next: NextFunction
) => {
  let email: string | undefined;
  if (req.method === 'GET') {
    email = req.query.email as string;
  } else if (req.method === 'POST' || req.method === 'PATCH') {
    email = req.body.email;
  }

  const childLogger = (req as any).childLogger as winston.Logger;

  if (!childLogger) {
    console.error('Child Logger not found on request object');
    return next(new Error('Internal Server Error'));
  }

  try {
    logWithMessageAndStep(childLogger, "Check User Step 1", "Check if email is provided", "checkUserExists", JSON.stringify({ email: email }), "silly");
    if (!email) {
      logWithMessageAndStep(childLogger, "Error Check User Step", "Missing email in request", "checkUserExists", {}, "warn");
      throw ErrorEnum.MissingEmail();
    }
    // Search for the user in both collections
    let user
    user = await prisma.users.findUnique({
      where: { email: email }
    });

    if (!user) {
      user = await prisma.superAdmin.findUnique({
        where: { email: email }
      });
    }

    logWithMessageAndStep(childLogger, "Check User Step 2", "Check if user exists in the database", "checkUserExists", JSON.stringify({ user: user }), "debug");
    if (!user) {
      logWithMessageAndStep(childLogger, "Error Check User Step", "User not found", "checkUserExists", JSON.stringify({ email: email }), "error");
      throw ErrorEnum.UserNotFoundwithEmail(email);
    }

    req.user = user as unknown as IUserWithDid | IsystemAdmin;
    req.email = email

    logWithMessageAndStep(childLogger, "Check User Step 3", "User found and added to request", "checkUserExists", JSON.stringify({ user: req.user }), "debug");

    next();
  } catch (error) {
    logWithMessageAndStep(childLogger, "Error Check User Step", "Error occurred while checking user", "checkUserExists", JSON.stringify({ error: error }), "error");
    next(error);
  }
};
