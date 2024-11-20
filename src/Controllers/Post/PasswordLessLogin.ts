/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response, NextFunction, Request } from "express";
import winston from "winston";
import { logWithMessageAndStep } from "../../Helpers/Logger/logger.js";
import { generateTokens, refreshAccessToken } from "../../Utils/scripts/tokenUtils.js";
import { sendOtpRequest, verifyOtpRequest } from "../../externalApis/otpService.js";
import { prisma } from "../../db/client.js";
import { otpPurpose } from "../../DataTypes/enums/IUserEnums.js";
import { LoginUserRequest } from "src/Middleware/UserExist.js";
import { ErrorEnum, MongooseError } from "../../DataTypes/enums/Error.js";
import { IUser } from "../../DataTypes/interfaces/IUser.js";
import { PasswordLessUserValidation, UserValidation } from "../../Validation/UserValidation.js";

/**
 * add new user
 * @param userModelValidation
 */
export const addUser = async (userModelValidation: IUser, childLogger: any) => {
    try {
        logWithMessageAndStep(childLogger, "Step 8", "Adding User via PrismaDB", "register", JSON.stringify(userModelValidation), "debug")

        const newUser = await prisma.wiwusers.create({
            data: {
                email: userModelValidation.email,
                name: userModelValidation.name,
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

export const loginWithOtp = async (
    req: LoginUserRequest,
    res: Response,
    next: NextFunction
) => {
    const childLogger = (req as any).childLogger as winston.Logger;

    if (!childLogger) {
        return next(new Error("Internal Server Error"));
    }

    const { phoneNumber, deviceId } = req.body;

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
        const user = await prisma.wiwusers.findUnique({
            where: { phoneNumber },
            select: {
                id: true,
                email: true,
                name: true,
                phoneNumber: true,
                category: true,
            },
        });

        if (!user) {
            return next(ErrorEnum.UserNotFoundwithPhone(phoneNumber));
        }

        // Send OTP
        const otpData = {
            purpose: otpPurpose.LOGIN,
            phoneNumber,
            deviceId,
            user: user.name,
        };

        const otpResponse = await mockSendOtpRequest(otpData);

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

    const { otp, trxId, deviceId, phoneNumber } = req.body;

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
        // const otpVerified = await verifyOtpRequest(verifyOtpData);
        const otpVerified = await mockVerifyOtpRequest(verifyOtpData);
        console.log(otpVerified);

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
        let user
        if (phoneNumber) {

            user = await prisma.wiwusers.findUnique({
                where: { phoneNumber: phoneNumber },
                select: {
                    id: true,
                    phoneNumber: true,
                    category: true,
                    address: true,
                    email: true,
                    name: true,
                },
            });
        }

        if (!user) {
            logWithMessageAndStep(
                childLogger,
                "Error Step",
                "User not found after OTP verification",
                "verifyOtpLogin",
                phoneNumber,
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

        res.status(200).json({data: {
            name: user.name,
            token: {
              accessToken,
              refreshToken
            },
            email: user.email,
            category: user.category,
          }});
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

const mockSendOtpRequest = async (otpData: any) => {
    // Simulate a delay for async behavior
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Simulated response
    const mockResponse = {
        status: "success",
        trxId: `trx_${Math.random().toString(36).substr(2, 9)}`,
        message: "OTP sent successfully",
    };

    return mockResponse;
};

const mockVerifyOtpRequest = async (verifyOtpData: any) => {
    // Simulate a delay for async behavior
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Simulated verification success/failure
    const isSuccess =true

    if (isSuccess) {
        return {
            status: "success",
            message: "OTP verified successfully",
        };
    } else {
        return null; // Simulate failure
    }
};

export const registerUser = async (
    req: LoginUserRequest,
    res: Response,
    next: NextFunction
) => {
    const childLogger = (req as any).childLogger as winston.Logger;

    if (!childLogger) {
        return next(new Error("Internal Server Error"));
    }
    try {
        logWithMessageAndStep(
            childLogger,
            "Step 1",
            "Initiating user registration",
            "registerUser",
            JSON.stringify(req.body),
            "info"
        );

        // Validate user input
        const userModelValidation: IUser | undefined = await PasswordLessUserValidation.validateAsync(req.body, childLogger);

        if (!userModelValidation) {
            throw ErrorEnum.SignUpValidationError(JSON.stringify(req.body));
        }

        // Check if phone number is available
        const isPhoneNoAvailable = await prisma.wiwusers.findUnique({
            where: { phoneNumber: String(userModelValidation.phoneNumber) },
        });

        if (isPhoneNoAvailable) {
            throw ErrorEnum.SignUpValidationError(userModelValidation.phoneNumber);
        }

        // Check if email is available
        const isEmailNoAvailable = await prisma.wiwusers.findUnique({
            where: { email: String(userModelValidation.email) },
        });

        if (isEmailNoAvailable) {
            throw ErrorEnum.SignUpValidationError(userModelValidation.email);
        }

        // Register the user
        const newUser = await addUser(userModelValidation, childLogger);

        logWithMessageAndStep(
            childLogger,
            "Step 2",
            "User registered successfully",
            "registerUser",
            JSON.stringify(newUser),
            "info"
        );

        res.status(201).json({
            message: "User registered successfully",
            data: newUser,
        });
    } catch (error) {
        logWithMessageAndStep(
            childLogger,
            "Error Step",
            "Error during user registration",
            "registerUser",
            JSON.stringify(error),
            "error"
        );
        return next(error);
    }
};