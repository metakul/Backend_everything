// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { Request, Response, NextFunction } from "express";
// import { IUser } from "../../DataTypes/interfaces/IUser";
// import { createVerifiablePresentation } from "../../Projects/veramo/create-verifiable-presentation-for-credential";
// import { verifyPresentation } from "../../Projects/veramo/verify-presentation";
// import { createSDRverifyCredential as verifyCredential } from "../../Projects/veramo/verify-credential.js";
// import { createSDR } from "../../Projects/veramo/createSDRreq";
// import { W3CVerifiableCredential } from "@veramo/core";
// import { UpdateUserValidation, UserValidation } from "../../Validation/UserValidation.js";
// import { accountStatus } from "../../DataTypes/enums/IUserEnums.js";
// import { ErrorEnum, MongooseError } from "../../DataTypes/enums/Error.js";
// import { RequestWithUser } from "../../Middleware/checkJwt";
// import { createIdentifier } from "../../Projects/veramo/create-identifier";
// import { createCredential } from "../../Projects/veramo/create-credential";
// import { prisma } from "../../db/client.js";
// import { genAPIKey } from "../../Utils/scripts/genAPIKey.js";
// import { logWithMessageAndStep } from "../../Helpers/Logger/logger.js";
// import winston from 'winston';



// /**
//  * add new user
//  * @param userModelValidation
//  */
// const addUser = async (userModelValidation: IUser, childLogger: any) => {
//     try {
//         logWithMessageAndStep(childLogger, "Step 8", "Adding User via PrismaDB", "register", JSON.stringify(userModelValidation), "debug")

//         const newUser = await prisma.users.create({
//             data: {
//                 email: userModelValidation.email,
//                 name: userModelValidation.name,
//                 password: userModelValidation.password,
//                 phoneNumber: userModelValidation.phoneNumber,
//                 address: userModelValidation.address,
//                 category: userModelValidation.category,
//                 accountStatus: userModelValidation.accountStatus || "pending"
//             }
//         });
//         logWithMessageAndStep(childLogger, "Step 9", "User added to database", "register", JSON.stringify(newUser), "debug")

//         return newUser;
//     } catch (error) {
//         logWithMessageAndStep(childLogger, "Error step addUser", "Error while adding User in PrismaDB", "register", JSON.stringify(error), "error")
//         throw MongooseError.ErrorOfMongoose()
//     }
// };



// /**
//  * Update user
//  * @param userId
//  * @param userModelValidation
//  */
// const processUpdateUser = async (
//     user: IUser,
//     userModelValidation: IUser,
//     childLogger: any
// ) => {
//     try {

//         const updateFields = {
//             accountStatus: userModelValidation.accountStatus,
//         };

//         const existingUser = await prisma.users.findUnique({
//             where: { id: user.id },
//             select: { didCreated: true }
//         });
//         logWithMessageAndStep(childLogger, "Step 5", "Updating user and checks for DID+apikey Is created or not", "updateUser", JSON.stringify(existingUser), "debug");

//         if (userModelValidation.accountStatus === accountStatus.Approved && existingUser && existingUser.didCreated !== true) {

//             logWithMessageAndStep(childLogger, "Step 5-A", "Creating DID and Apikey", "updateUser", "", "silly");

//             const api_key = await genAPIKey(childLogger)

//             logWithMessageAndStep(childLogger, "Step 5-B", "Apikey Created", "updateUser", JSON.stringify(api_key), "debug");

//             const didIdentifierInfo = await createIdentifier(user.email, childLogger);
//             logWithMessageAndStep(childLogger, "Step 5-C", "DID Created", "updateUser", JSON.stringify(didIdentifierInfo), "debug");

//             Object.assign(updateFields, {
//                 api_key: api_key,
//                 didCreated: true,
//                 did: didIdentifierInfo.did,
//                 controllerKeyId: didIdentifierInfo.controllerKeyId,
//                 keys: didIdentifierInfo.keys,
//                 services: didIdentifierInfo.services,
//                 provider: didIdentifierInfo.provider,
//             });
//         }

//         logWithMessageAndStep(childLogger, "Step 6", "Feilds after DID check to update user", "updateUser", JSON.stringify(updateFields), "debug");

//         await prisma.users.update({
//             where: { id: user.id },
//             data: updateFields
//         });

//         const updatedUser = await prisma.users.findUnique({
//             where: { id: user.id },
//             select: {
//                 id: true,
//                 email: true,
//                 category: true,
//                 accountStatus: true,
//                 didCreated: true,
//                 did: true,
//                 createdAt: true,
//                 updatedAt: true
//             }
//         });
//         logWithMessageAndStep(childLogger, "Step 7", "Updated User Information", "updateUser", JSON.stringify(updatedUser), "info");

//         return updatedUser;
//     } catch (error) {
//         logWithMessageAndStep(childLogger, "Error Step", "Error Updating User Information", "updateUser", JSON.stringify(error), "error");

//         throw MongooseError.ErrorOfMongoose()
//     }
// };

// // Function to increment the IssueCredentialCount
// const incrementIssueCredentialCount = async (email: IUser["email"]) => {
//     try {
//         const user = await prisma.users.findUnique({
//             where: { email: email },
//         });
//         if (user)
//             await prisma.users.update({
//                 where: { email: email },
//                 data: {
//                     IssueCredentialCount: (user?.IssueCredentialCount || 0) + 1
//                 }
//             });
//     } catch (error) {
//         throw MongooseError.ErrorOfMongoose()
//     }
// };

// /**
//  * SignUp User
//  * @param IUser
//  * 
//  */

// export const register = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) => {
//     const childLogger = (req as any).childLogger as winston.Logger;

//     if (!childLogger) {
//         console.error('Child Logger not found on request object');
//         return next(new Error('Internal Server Error'));
//     }

//     try {

//         logWithMessageAndStep(childLogger, "Step 1", "Reading FormData via Body", "register", "User regestering data", "info");

//         // Validate user input
//         const userModelValidation: IUser | undefined = await UserValidation.validateAsync(req.body, childLogger);

//         if (!userModelValidation) {
//             throw ErrorEnum.SignUpValidationError(JSON.stringify(req.body));
//         }

//         // Check if phone number is available
//         const isPhoneNoAvailable = await prisma.users.findUnique({
//             where: { phoneNumber: String(userModelValidation.phoneNumber) },
//         });
//         logWithMessageAndStep(childLogger, "Step 5", "Checking if phone is available", "register", JSON.stringify(!isPhoneNoAvailable), "debug");

//         if (isPhoneNoAvailable) {
//             throw ErrorEnum.SignUpValidationError(userModelValidation.phoneNumber);
//         }

//         // Check if email is available
//         const isEmailNoAvailable = await prisma.users.findUnique({
//             where: { email: String(userModelValidation.email) },
//         });
//         logWithMessageAndStep(childLogger, "Step 6", "Checking if email is available", "register", JSON.stringify(!isEmailNoAvailable), "debug");

//         if (isEmailNoAvailable) {
//             throw ErrorEnum.SignUpValidationError(userModelValidation.email);
//         }

//         // Register the user
//         logWithMessageAndStep(childLogger, "Step 7", "Sending data to Prisma DB for user registration", "register", JSON.stringify(userModelValidation), "info");

//         await addUser(userModelValidation, childLogger).then((newUser) => {
//             res.status(201).json({
//                 message: "User Registered Successfully",
//                 data: newUser,
//                 statusCode: 200
//             });
//         }).catch((error) => {
//             logWithMessageAndStep(childLogger, "Error Register", "Error while Saving User Inside AddUser Function", "register", JSON.stringify(error), "error");
//             throw ErrorEnum.InternalserverError(error)

//         })
//     } catch (error) {
//         // Log the error step
//         logWithMessageAndStep(childLogger, "Error Register", "Error while calling API", "register", JSON.stringify(error), "error");
//         return next(error); // Pass the error to the error middleware
//     }
// };


// /**
//  * Upadte user
//  * @param req
//  * @param res
//  * @param next
//  */
// export const updateUser = async (
//     req: RequestWithUser,
//     res: Response,
//     next: NextFunction
// ) => {
//     const childLogger = (req as any).childLogger as winston.Logger;

//     if (!childLogger) {
//         console.error('Child Logger not found on request object');
//         return next(new Error('Internal Server Error'));
//     }
//     try {
//         const user = req.user
//         if (user) {
//             logWithMessageAndStep(childLogger, "Step 1", "Reading FormData via Body", "updateUser", JSON.stringify(req.body), "info");

//             const userModelValidation: IUser | undefined = await UpdateUserValidation.validateAsync(
//                 req.body,
//                 childLogger
//             );
//             // Check if the provided account status is valid
//             if (userModelValidation.accountStatus &&
//                 !Object.values(accountStatus).includes(userModelValidation.accountStatus)
//             ) {
//                 throw ErrorEnum.InvalidAccountStatus(user.accountStatus as accountStatus)
//             }
//             logWithMessageAndStep(childLogger, "Step 4", "Sending data to Prisma DB to update User", "updateUser", JSON.stringify(userModelValidation), "info");

//             await processUpdateUser(
//                 user,
//                 userModelValidation,
//                 childLogger
//             ).then((updatedUser) => {
//                 logWithMessageAndStep(childLogger, "Step 8", "Sending Updated Data to response", "updateUser", JSON.stringify(userModelValidation), "info");

//                 res.status(200).json({
//                     message: "User Updated SuccessFully",
//                     data: updatedUser,
//                     statusCode: 201
//                 });

//             }).catch((error) => {
//                 logWithMessageAndStep(childLogger, "Error Step", "Error Sending updated Response", "updateUser", JSON.stringify(error), "error");

//                 throw ErrorEnum.InternalserverError(error)
//             })
//         }

//         else {
//             throw ErrorEnum.InternalserverError("Error validating User")
//         }
//     } catch (error) {
//         logWithMessageAndStep(childLogger, "Error Update User", "Error while calling API", "updateUser", JSON.stringify(error), "error");
//         return next(error);
//     }
// };


// /**
//  * Post user credentials 
//  * @param 
//  */
// export const create_Credential = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) => {
//     try {
//         const { _alias } = req.body

//         if (!_alias) {
//             throw ErrorEnum.MissingAlias()
//         }

//         else {
//             await createCredential(_alias).then(async (result) => {
//                 await incrementIssueCredentialCount(_alias)
//                 res.json({
//                     message: `Credential SuccessFully Created For ${_alias}`,
//                     result: result,
//                     statusCode: 200
//                 });
//             }).catch((error) => {
//                 return next(error)
//             })
//         }
//     } catch (error) {
//         return next(error)
//     }
// };
// /**
//  * Post user identifier IIdentifier
//  * @param 
//  */

// export const create_Identifier = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) => {
//     try {
//         const { _alias } = req.body
//         if (!_alias) {
//             throw ErrorEnum.MissingAlias()
//         }
//         const result = await createIdentifier(_alias, "childLogger"); // todo send childlogger inside the pai function
//         res.json({
//             message: "Identifier Created SuccessFully",
//             data: result,
//             statusCode: 200
//         });
//     } catch (error) {
//         return next(error)
//     }
// };


// /**
//  * Create user Verifiable Presentation
//  * @param 
//  */
// export const create_VerifiablePresentation = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) => {
//     try {
//         const { credential }: { credential: W3CVerifiableCredential } = req.body
//         if (!credential) {
//             throw ErrorEnum.MissingCredential()
//         }
//         else {
//             const result = await createVerifiablePresentation(credential);
//             res.json({
//                 message: "Verifiable Presentation Created SuccessFully",
//                 data: result,
//                 statusCode: 200
//             });
//         }
//     } catch (error) {
//         return next(error)
//     }
// };

// /**
//  * Verifiable Presentation
//  * @param 
//  */
// export const verify_Presentation = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) => {
//     try {
//         const { decryptedMessage: proofpresentation } = req.body;
//         const result = await verifyPresentation(proofpresentation);
//         res.status(200).json({
//             message: "Presentation Verified SuccessFully",
//             data: result,
//             statusCode: 200
//         });
//     } catch (error) {
//         return next(error)
//     }
// };

// /**
//  * user verify credential
//  * @param 
//  */
// export const verify_credential = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) => {
//     try {
//         const { credential } = req.body
//         const result = await verifyCredential(credential);
//         res.json({
//             message: "Credential Verified SuccessFully",
//             data: result,
//             statusCode: 200
//         });

//     } catch (error) {
//         return next(error)
//     }
// };
// /**
//  * user Create SDR
//  * @param 
//  */
// export const create_SDR = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) => {
//     try {
//         const { claimType, issuerDID } = req.body
//         const result = await createSDR(claimType, issuerDID);
//         res.json({
//             message: "SDR Created SuccessFully",
//             data: result,
//             statusCode: 200
//         });

//     } catch (error) {
//         return next(error)
//     }
// };