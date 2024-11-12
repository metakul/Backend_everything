import express from "express";
import * as UserPostController from "../../Controllers/Post/UserPostController.js";
import * as UserGetController from "../../Controllers/Get/UserGetController.js";
import CheckPermission from "../../Middleware/CheckPermission.js";
import { ReadPermissionControl, UpdatePermissionControl } from "../../DataTypes/rbac/permission.js";
import checkJwt from "../../Middleware/checkJwt.js";

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Create a new user
 *     tags: 
 *      - User Onboarding
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request
 */
router.post("/register", UserPostController.register);

/**
 * @swagger
 * /orgList:
 *   get:
 *     summary: Get a list of organizations
 *     tags: 
 *      - User Onboarding
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of organizations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The organization ID
 *                     example: 1
 *                   name:
 *                     type: string
 *                     description: The organization name
 *                     example: Organization 1
 *       401:
 *         description: Unauthorized
 */
router.get("/orgList",
    checkJwt,
    CheckPermission(ReadPermissionControl.can_read_orgList),
    UserGetController.orgList);

/**
 * @swagger
 * /updateOrg:
 *   patch:
 *     summary: Update an organization
 *     tags: 
 *      - User Onboarding
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 1
 *               name:
 *                 type: string
 *                 example: Updated Organization Name
 *     responses:
 *       200:
 *         description: Organization updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.patch("/updateOrg",
    checkJwt,
    CheckPermission(UpdatePermissionControl.can_update_org),
    UserPostController.updateUser);

export default router;