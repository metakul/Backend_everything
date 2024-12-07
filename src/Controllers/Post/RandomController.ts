import { Request, Response, NextFunction } from "express";
import { prisma } from "../../db/client.js";
import { logWithMessageAndStep } from "../../Helpers/Logger/logger.js";
import winston from "winston";
import config from "../../config.js";

export const incrementDownloadCount = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const childLogger = (req as any).childLogger as winston.Logger;

    if (!childLogger) {
        throw new Error("Internal Server Error");
    }

    // const { password } = req.body;

    try {
        logWithMessageAndStep(
            childLogger,
            "Step 1",
            "Received password for validation",
            "incrementDownloadCount",
            JSON.stringify(req.body),
            "info"
        );

        // Verify password against env variable
        // const isPasswordValid = password === config.PASSWORD;

        // if (!isPasswordValid) {
        //     logWithMessageAndStep(childLogger, "Error Step", "Invalid password", "incrementDownloadCount", "", "warn");
        //     throw new Error("Unauthorized: Invalid password");
        // }

        // Retrieve or create the TotalDownload entry
        let totalDownload = await prisma.totalDownload.findFirst();

        if (!totalDownload) {
            totalDownload = await prisma.totalDownload.create({
                data: { count: 0 }
            });
            logWithMessageAndStep(childLogger, "Step 2", "Created initial TotalDownload entry", "incrementDownloadCount", JSON.stringify(totalDownload), "info");
        }

        // Increment the download count
        const result = await prisma.totalDownload.update({
            where: { id: totalDownload.id },
            data: { count: { increment: 1 } }
        });

        logWithMessageAndStep(childLogger, "Step 3", "Download count incremented", "incrementDownloadCount", JSON.stringify(result), "info");

        res.status(200).json({
            message: "Download count incremented successfully",
            newCount: result.count,
        });
    } catch (error) {
        logWithMessageAndStep(childLogger, "Error Step", "Error incrementing download count", "incrementDownloadCount", JSON.stringify(error), "error");
        next(error); // Pass error to the next middleware
    }
};
