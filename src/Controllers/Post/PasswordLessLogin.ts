/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response, NextFunction, Request } from "express";
import winston from "winston";
import { logWithMessageAndStep } from "../../Helpers/Logger/logger.js";
import { generateTokens, refreshAccessToken } from "../../Utils/scripts/tokenUtils.js";
import { sendOtpRequest, verifyOtpRequest } from "../../externalApis/otpService.js";
import { prisma } from "../../db/client.js";
import { otpPurpose } from "../../DataTypes/enums/IUserEnums.js";
import { LoginUserRequest } from "src/Middleware/UserExist.js";

export const loginWithOtp = async (
    req: LoginUserRequest,
    res: Response,
    next: NextFunction
) => {
    const childLogger = (req as any).childLogger as winston.Logger;

    if (!childLogger) {
        return next(new Error("Internal Server Error"));
    }

    const { identifier, deviceId, name, email, password, phoneNumber, address, accountStatus, category, subcategory } = req.body;

    try {
        logWithMessageAndStep(
            childLogger,
            "Step 1",
            "Initiating OTP login",
            "loginWithOtp",
            JSON.stringify(req.body),
            "info"
        );

        // Fetch user by phone number
        let user = await prisma.users.findUnique({
            where: { phoneNumber: identifier },
            select: {
                id: true,
                email: true,
                name: true,
                phoneNumber: true,
                category: true,
            },
        });

        // If user does not exist, create a new one
        if (!user) {
            logWithMessageAndStep(
                childLogger,
                "Step 1.1",
                "User not found, creating new user",
                "loginWithOtp",
                JSON.stringify(req.body),
                "info"
            );

            user = await prisma.users.create({
                data: {
                    name,
                    email,
                    password, // Ensure you hash the password securely
                    phoneNumber,
                    address,
                    accountStatus,
                    category,
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    phoneNumber: true,
                    category: true,
                },
            });

            logWithMessageAndStep(
                childLogger,
                "Step 1.2",
                "New user created successfully",
                "loginWithOtp",
                JSON.stringify(user),
                "info"
            );
        }

        // Send OTP
        const otpData = {
            purpose: otpPurpose.LOGIN,
            identifier,
            deviceId,
            user: user.name,
        };

        const otpResponse = await sendOtpRequest(otpData);

        logWithMessageAndStep(
            childLogger,
            "Step 2",
            "OTP sent successfully",
            "loginWithOtp",
            JSON.stringify(otpResponse),
            "info"
        );

        res.status(200).json({
            message: "OTP sent successfully",
            data: otpResponse,
        });
    } catch (error) {
        logWithMessageAndStep(
            childLogger,
            "Error Step",
            "Error during OTP login",
            "loginWithOtp",
            JSON.stringify(error),
            "error"
        );
        return next(error);
    }
};

export const verifyOtpLogin = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const childLogger = (req as any).childLogger as winston.Logger;

    if (!childLogger) {
        return next(new Error("Internal Server Error"));
    }

    const { otp, trxId, deviceId, identifier } = req.body;

    try {
        logWithMessageAndStep(
            childLogger,
            "Step 1",
            "Verifying OTP",
            "verifyOtpLogin",
            JSON.stringify(req.body),
            "info"
        );

        // Verify OTP
        const verifyOtpData = { otp, trxId, deviceId };
        const otpVerified = await verifyOtpRequest(verifyOtpData);

        if (!otpVerified) {
            logWithMessageAndStep(
                childLogger,
                "Error Step",
                "OTP verification failed",
                "verifyOtpLogin",
                JSON.stringify(verifyOtpData),
                "error"
            );
            return res.status(400).json({ error: "Invalid or expired OTP" });
        }

        // Fetch user details
        const user = await prisma.users.findUnique({
            where: identifier.includes("@")
                ? { email: identifier }
                : { phoneNumber: identifier },
            select: {
                id: true,
                email: true,
                name: true,
                phoneNumber: true,
                category: true,
            },
        });

        if (!user) {
            logWithMessageAndStep(
                childLogger,
                "Error Step",
                "User not found after OTP verification",
                "verifyOtpLogin",
                identifier,
                "error"
            );
            return res.status(404).json({ error: "User not found" });
        }

        // Generate JWT tokens
        const { accessToken, refreshToken } = await generateTokens(user, true);

        logWithMessageAndStep(
            childLogger,
            "Step 2",
            "JWT token generated",
            "verifyOtpLogin",
            JSON.stringify(user),
            "info"
        );

        if (refreshToken) {
            res.cookie("refresh_token", refreshToken.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
            });
        }

        res.status(200).json({
            message: "Login successful",
            accessToken: accessToken.token,
        });
    } catch (error) {
        logWithMessageAndStep(
            childLogger,
            "Error Step",
            "Error during OTP verification",
            "verifyOtpLogin",
            JSON.stringify(error),
            "error"
        );
        return next(error);
    }
};

export const refreshLoginToken = async (
    req: LoginUserRequest,
    res: Response,
    next: NextFunction
) => {
    const childLogger = (req as any).childLogger as winston.Logger;

    if (!childLogger) {
        return next(new Error('Internal Server Error'));
    }

    const refreshToken = req.cookies.refresh_token;


    if (!refreshToken) {
        logWithMessageAndStep(childLogger, "Error Step", "Refresh token is missing", "refreshLoginToken", "", "error");
        return res.status(400).json({ error: 'Refresh token is required' });
    }

    try {
        logWithMessageAndStep(childLogger, "Step 1", "Attempting to refresh access token", "refreshLoginToken", JSON.stringify({ refreshToken }), "info");

        // Refresh the access token using the provided refresh token
        const newAccessToken = refreshAccessToken(refreshToken);

        logWithMessageAndStep(childLogger, "Step 2", "Access token refreshed successfully", "refreshLoginToken", JSON.stringify(newAccessToken), "debug");

        return res.status(200).json({
            accessToken: newAccessToken.token,
            expiresIn: newAccessToken.expiresIn,
        });
    } catch (error) {
        logWithMessageAndStep(childLogger, "Error Step", "Error during access token refreshing process", "refreshLoginToken", JSON.stringify(error), "error");
        return next(error);
    }
};
