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
 * /login:
 *   post:
 *     summary: User login
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
 *         description: User logged in successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post("/passwordless/login",
    PasswordLessLogin.loginWithOtp);

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Get user profile
 *     tags: 
 *       - Common
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/passwordless/profile",
    checkJwt([UserCategory.Verifier, UserCategory.Holder, UserCategory.User,UserCategory.SUPER_ADMIN,UserCategory.ROADIES_SUPER_ADMIN]),
    // (req, res, next) => {
    //     const identifierType = req.query.phoneNumber ? 'phoneNumber' : 'email';
    //     ValidateApiKey(req, res, next, identifierType);
    // },
    checkUserCategoryExists,
    // CheckPermission(ReadPermissionControl.can_read_profile),
    CommonGetController.profile);

/**
 * @swagger
 * /refreshLoginToken:
 *   post:
 *     summary: Refresh login token
 *     tags: 
 *       - Common
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post("/passwordless/refreshLoginToken",
    PasswordLessLogin.refreshLoginToken);




    export default router;