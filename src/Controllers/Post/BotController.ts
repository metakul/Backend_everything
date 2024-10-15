/* eslint-disable @typescript-eslint/no-explicit-any */
import {  Response, NextFunction } from "express";
import { IUser } from "../../DataTypes/interfaces/IUser";
import { ErrorEnum } from "../../DataTypes/enums/Error.js";
import { RequestWithUser } from "../../Middleware/checkJwt";
import { prisma } from "../../db/client.js";
import path from "path"
import { startBot } from "../../Projects/bots/main.js";
import cron from 'node-cron';
const scheduledJobs: { [key: string]: cron.ScheduledTask } = {};
import { fileURLToPath } from 'url';

// Define __dirname manually in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


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


