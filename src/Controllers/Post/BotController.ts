/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from "express";
import { IUser } from "../../DataTypes/interfaces/IUser";
import { UpdateUserValidation, UserValidation } from "../../Validation/UserValidation.js";
import { accountStatus } from "../../DataTypes/enums/IUserEnums.js";
import { ErrorEnum, MongooseError } from "../../DataTypes/enums/Error.js";
import { RequestWithUser } from "../../Middleware/checkJwt";
import { prisma } from "../../db/client.js";
import { genAPIKey } from "../../Utils/scripts/genAPIKey.js";
import { logWithMessageAndStep } from "../../Helpers/Logger/logger.js";
import winston from 'winston';
import path from "path"
import { startBot } from "../../Projects/bots/main.js";
import cron from 'node-cron';
const scheduledJobs: { [key: string]: cron.ScheduledTask } = {};
import { fileURLToPath } from 'url';

// Define __dirname manually in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * add new user
 * @param userModelValidation
 */
const addUser = async (userModelValidation: IUser, childLogger: any) => {
    try {
        logWithMessageAndStep(childLogger, "Step 8", "Adding User via PrismaDB", "register", JSON.stringify(userModelValidation), "debug")

        const newUser = await prisma.users.create({
            data: {
                email: userModelValidation.email,
                name: userModelValidation.name,
                password: userModelValidation.password,
                phoneNumber: userModelValidation.phoneNumber,
                address: userModelValidation.address,
                category: userModelValidation.category,
                accountStatus: userModelValidation.accountStatus || "pending"
            }
        });
        logWithMessageAndStep(childLogger, "Step 9", "User added to database", "register", JSON.stringify(newUser), "debug")

        return newUser;
    } catch (error) {
        logWithMessageAndStep(childLogger, "Error step addUser", "Error while adding User in PrismaDB", "register", JSON.stringify(error), "error")
        throw MongooseError.ErrorOfMongoose()
    }
};



/**
 * Update user
 * @param userId
 * @param userModelValidation
 */
const processUpdateUser = async (
    user: IUser,
    userModelValidation: IUser,
    childLogger: any
) => {
    try {

        const updateFields = {
            accountStatus: userModelValidation.accountStatus,
        };

        await prisma.users.update({
            where: { id: user.id },
            data: updateFields
        });

        const updatedUser = await prisma.users.findUnique({
            where: { id: user.id },
            select: {
                id: true,
                email: true,
                category: true,
                accountStatus: true,
                createdAt: true,
                updatedAt: true
            }
        });
        logWithMessageAndStep(childLogger, "Step 7", "Updated User Information", "updateUser", JSON.stringify(updatedUser), "info");

        return updatedUser;
    } catch (error) {
        logWithMessageAndStep(childLogger, "Error Step", "Error Updating User Information", "updateUser", JSON.stringify(error), "error");

        throw MongooseError.ErrorOfMongoose()
    }
};

/**
 * SignUp User
 * @param IUser
 * 
 */

export const register = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const childLogger = (req as any).childLogger as winston.Logger;

    if (!childLogger) {
        console.error('Child Logger not found on request object');
        return next(new Error('Internal Server Error'));
    }

    try {

        logWithMessageAndStep(childLogger, "Step 1", "Reading FormData via Body", "register", "User regestering data", "info");

        // Validate user input
        const userModelValidation: IUser | undefined = await UserValidation.validateAsync(req.body, childLogger);

        if (!userModelValidation) {
            throw ErrorEnum.SignUpValidationError(JSON.stringify(req.body));
        }

        // Check if phone number is available
        const isPhoneNoAvailable = await prisma.users.findUnique({
            where: { phoneNumber: String(userModelValidation.phoneNumber) },
        });
        logWithMessageAndStep(childLogger, "Step 5", "Checking if phone is available", "register", JSON.stringify(!isPhoneNoAvailable), "debug");

        if (isPhoneNoAvailable) {
            throw ErrorEnum.SignUpValidationError(userModelValidation.phoneNumber);
        }

        // Check if email is available
        const isEmailNoAvailable = await prisma.users.findUnique({
            where: { email: String(userModelValidation.email) },
        });
        logWithMessageAndStep(childLogger, "Step 6", "Checking if email is available", "register", JSON.stringify(!isEmailNoAvailable), "debug");

        if (isEmailNoAvailable) {
            throw ErrorEnum.SignUpValidationError(userModelValidation.email);
        }

        // Register the user
        logWithMessageAndStep(childLogger, "Step 7", "Sending data to Prisma DB for user registration", "register", JSON.stringify(userModelValidation), "info");

        await addUser(userModelValidation, childLogger).then((newUser) => {
            res.status(201).json(
                newUser,
               );
        }).catch((error) => {
            logWithMessageAndStep(childLogger, "Error Register", "Error while Saving User Inside AddUser Function", "register", JSON.stringify(error), "error");
            throw ErrorEnum.InternalserverError(error)

        })
    } catch (error) {
        // Log the error step
        logWithMessageAndStep(childLogger, "Error Register", "Error while calling API", "register", JSON.stringify(error), "error");
        return next(error); // Pass the error to the error middleware
    }
};


/**
 * Upadte user
 * @param req
 * @param res
 * @param next
 */
export const updateUser = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
) => {
    const childLogger = (req as any).childLogger as winston.Logger;

    if (!childLogger) {
        console.error('Child Logger not found on request object');
        return next(new Error('Internal Server Error'));
    }
    try {
        const user = req.user
        if (user) {
            logWithMessageAndStep(childLogger, "Step 1", "Reading FormData via Body", "updateUser", JSON.stringify(req.body), "info");

            const userModelValidation: IUser | undefined = await UpdateUserValidation.validateAsync(
                req.body,
                childLogger
            );
            // Check if the provided account status is valid
            if (userModelValidation.accountStatus &&
                !Object.values(accountStatus).includes(userModelValidation.accountStatus)
            ) {
                throw ErrorEnum.InvalidAccountStatus(user.accountStatus as accountStatus)
            }
            logWithMessageAndStep(childLogger, "Step 4", "Sending data to Prisma DB to update User", "updateUser", JSON.stringify(userModelValidation), "info");

            await processUpdateUser(
                user,
                userModelValidation,
                childLogger
            ).then((updatedUser) => {
                logWithMessageAndStep(childLogger, "Step 8", "Sending Updated Data to response", "updateUser", JSON.stringify(userModelValidation), "info");

                res.status(200).json(
                    updatedUser,
                    );

            }).catch((error) => {
                logWithMessageAndStep(childLogger, "Error Step", "Error Sending updated Response", "updateUser", JSON.stringify(error), "error");

                throw ErrorEnum.InternalserverError(error)
            })
        }

        else {
            throw ErrorEnum.InternalserverError("Error validating User")
        }
    } catch (error) {
        logWithMessageAndStep(childLogger, "Error Update User", "Error while calling API", "updateUser", JSON.stringify(error), "error");
        return next(error);
    }
};


// Bot Controller
import fs from 'fs';
export const create_bot = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
) => {
    try {
        // Check if the file was uploaded
        if (!req.file) {
            throw ErrorEnum.MissingFIle();
        }

        const {
            _alias,
            episode,
            videoNumber,
            videoDuration,
            accessToken,
            location,
            hashtags,
            caption,
            cronSchedule // New parameter for scheduling
        } = req.body;


        // Validate required fields
        if (!_alias) {
            throw ErrorEnum.MissingAlias();
        }

        const user = req.user as IUser; // Assuming user is attached to req

        const userId = user.email as string; // Get user ID, you should update this to get from req.user if needed.

        const assetsPath = path.join(__dirname, '../../Projects/bots/assets');
        const beepPath = path.join(__dirname, '../../Projects/bots');

        // Prepare directories
        const inputDir = path.join(assetsPath,  'input');
        const outputDir = path.join(assetsPath,  'output');
        const beepSounds = path.join(beepPath);

        fs.mkdirSync(inputDir, { recursive: true });
        fs.mkdirSync(outputDir, { recursive: true });

        // Save the uploaded file
        const inputFilePath = path.join(inputDir, req.file.filename);
        fs.renameSync(req.file.path, inputFilePath);

        const custoIinputFilePath = `${inputDir}/${req.file.filename}`;
        const customOutputFilePath = `${outputDir}`;

        // Prepare the config object
        const config = {
            episode,
            videoNumber,
            videoDuration,
            accessToken,
            location,
            hashtags,
            caption,
            inputVideo: custoIinputFilePath,
            outputDir: customOutputFilePath,
            beepAudio: `${beepSounds}/beep.mp3`,
        };

        // Create the bot in the database first
        const newBot = await prisma.bot.create({
            data: {
                alias: _alias,
                userId: userId,
                filePath: inputFilePath,
                episode,
                videoNumber,
                videoDuration,
                accessToken,
                location,
                hashtags,
                caption,
                cronSchedule, // Save the schedule to the database
            },
        });

        // Respond early before the cron job or bot starts
        res.status(201).json(
             newBot,
          );

        // After responding, start the cron job or run the bot immediately
      
            await startBot(config); // Start immediately if no schedule
    } catch (error) {
        console.log(error);
        next(error); // Pass the error to the error handler
    }
};






// New function to get bots
export const get_bots = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = req.user as IUser; // Assuming user is attached to req
        const userId = user.email; // Get user ID

          // Fetch bots for the logged-in user using Prisma
          const bots = await prisma.bot.findMany({
            where: { userId: userId },
        });
        // Check if any bots were found
        if (!bots.length) {
            return res.status(404).json({
                success: false,
                message: 'No bots found for this user.'
            });
        }

        // Respond with the retrieved bots
        res.status(200).json(
             bots,
         );
    } catch (error) {
        next(error); // Pass the error to the error handler middleware
    }
};


export const update_bot = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
) => {
    try {
        const { botId } = req.params;
        const {
            episode,
            videoNumber,
            videoDuration,
            accessToken,
            location,
            hashtags,
            caption,
            cronSchedule // New field to update the cron schedule
        } = req.body;

        const existingBot = await prisma.bot.findUnique({
            where: { id: botId },
        });

        if (!existingBot) {
            throw ErrorEnum.BotNotFound();
        }

        const updatedData: any = {};
        
        // Update fields if provided
        if (episode !== undefined) updatedData.episode = episode;
        if (videoNumber !== undefined) updatedData.videoNumber = videoNumber;
        if (videoDuration !== undefined) updatedData.videoDuration = videoDuration;
        if (accessToken !== undefined) updatedData.accessToken = accessToken;
        if (location !== undefined) updatedData.location = location;
        if (hashtags !== undefined) updatedData.hashtags = hashtags;
        if (caption !== undefined) updatedData.caption = caption;
        
        // Check if cronSchedule is provided for updating
        if (cronSchedule !== undefined) {
            updatedData.cronSchedule = cronSchedule;

            // If job already exists, stop it
            const job = scheduledJobs[botId];
            if (job) {
                job.stop(); // Stop existing job
                delete scheduledJobs[botId]; // Remove from scheduled jobs
            }

            // Create new scheduled job
            const newJob = cron.schedule(cronSchedule, () => {
                startBot(existingBot); // Start bot with existing config
            });
            newJob.start(); // Start new job

            // Store the new job
            scheduledJobs[botId] = newJob;
        }

        // Update the bot in the database
        const updatedBot = await prisma.bot.update({
            where: { id: botId },
            data: updatedData,
        });

        res.status(200).json(
             updatedBot);
    } catch (error) {
        next(error);
    }
};




export const pause_bot = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
) => {
    try {
        const { botId } = req.params;

        // Pause the job if it exists
        const job = scheduledJobs[botId];
        if (job) {
            job.stop();
        }

        // Update the bot status to 'paused'
        const updatedBot = await prisma.bot.update({
            where: { id: botId },
            data: { status: 'paused', isPaused: true },
        });

        res.status(200).json(
           updatedBot,
          );
    } catch (error) {
        next(error);
    }
};


export const resume_bot = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
) => {
    try {
        const { botId } = req.params;

        // Resume the job if it exists
        const job = scheduledJobs[botId];
        if (job) {
            job.start();
        }

        // Update the bot status to 'running'
        const updatedBot = await prisma.bot.update({
            where: { id: botId },
            data: { status: 'running', isPaused: false },
        });

        res.status(200).json(
            updatedBot,
            );
    } catch (error) {
        next(error);
    }
};


