// import { Request, Response, NextFunction } from 'express';
// import { prisma } from '../db/client.js';
// import { IUserWithDid } from '../DataTypes/interfaces/IUser.js';
// import { APIKeyError, ErrorEnum } from '../DataTypes/enums/Error.js';
// import winston from 'winston';
// import { logWithMessageAndStep } from '../Helpers/Logger/logger.js';
// import { RequestWithUser } from './checkJwt.js';

// export const ValidateApiKey = async (
//   req: RequestWithUser,
//   res: Response,
//   next: NextFunction
// ) => {

//   const apiKey = req.headers['x-api-key'];


//   let email: string | undefined;
//   if (req.method === 'GET') {
//     email = req.query.email as string;
//   } else if (req.method === 'POST' || req.method === 'PATCH') {
//     email = req.body.email;
//   }

//   const childLogger = (req as any).childLogger as winston.Logger;

//   if (!childLogger) {
//     console.error('Child Logger not found on request object');
//     return next(new Error('Internal Server Error'));
//   }

//   try {
//     logWithMessageAndStep(childLogger, "Validate API Key Step 1", "Check if API key and email are provided", "ValidateApiKey", { apiKey: JSON.stringify(apiKey), email: JSON.stringify(email) }, "info");

//     if (!apiKey) {
//       logWithMessageAndStep(childLogger, "Error Validate API Key Step", "Missing API key in request", "ValidateApiKey", {}, "warn");
//       throw APIKeyError.NoAPIKey();
//     }

//     if (!email) {
//       logWithMessageAndStep(childLogger, "Error Validate API Key Step", "Missing email in request", "ValidateApiKey", {}, "warn");
//       throw ErrorEnum.MissingEmail();
//     }
//     const user = await prisma.users.findUnique({
//       where: { email: email }
//     });
//     logWithMessageAndStep(childLogger, "Validate API Key Step 2", "Check if user exists and has an API key", "ValidateApiKey", { user: JSON.stringify(user) }, "debug");

//     if (!user?.api_key) {
//       logWithMessageAndStep(childLogger, "Error Validate API Key Step", "No API key found for user", "ValidateApiKey", { email: JSON.stringify(email) }, "warn");
//       throw APIKeyError.NoAPIKeyFound();
//     }
//     if (user?.api_key !== apiKey) {
//       logWithMessageAndStep(childLogger, "Error Validate API Key Step", "API key validation failed", "ValidateApiKey", { email: JSON.stringify(email) }, "error");
//       throw APIKeyError.ErrorValidatingAPIKey();
//     }
//     req.user = user as unknown as IUserWithDid;
//     req.email = email

//     logWithMessageAndStep(childLogger, "Validate API Key Step 3", "User validated and added to request", "ValidateApiKey", { user: JSON.stringify(req.user) }, "debug");

//     next();

//   } catch (error) {
//     logWithMessageAndStep(childLogger, "Error Validate API Key Step", "Error occurred while validating API key", "ValidateApiKey", { error: JSON.stringify(error) }, "error");

//     next(error);
//   }
// };
