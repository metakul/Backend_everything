import express from "express";
import { checkUserExists } from "../../Middleware/UserExist.js";
import { checkUserCategoryExists } from "../../Middleware/IfUserCategoryExist.js";
// import { ValidateApiKey } from "../../Middleware/ValidateApiKey.js";
import checkJwt from "../../Middleware/checkJwt.js";
import * as PasswordLessLogin from "../../Controllers/Post/PasswordLessLogin.js";
import * as CommonGetController from "../../Controllers/Get/CommonGetController.js";
import { UserCategory } from "../../DataTypes/enums/IUserEnums.js";

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * /passwordless/login:
 *   post:
 *     summary: User login with OTP
 *     tags: 
 *       - Common
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "1234567890"
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post("/passwordless/login", PasswordLessLogin.loginWithOtp);

/**
 * @swagger
 * /passwordless/verifyOtp:
 *   post:
 *     summary: Verify OTP for login
 *     tags: 
 *       - Common
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               trxId:
 *                 type: string
 *                 example: "trx_abc123xyz"
 *               deviceId:
 *                 type: string
 *                 example: "device_12345"
 *               identifier:
 *                 type: string
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid or expired OTP
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post("/passwordless/verifyOtp", PasswordLessLogin.verifyOtpLogin);


export default router;
