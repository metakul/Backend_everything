import express from "express";
import * as SuperAdminController from "../../Controllers/Post/SuperAdmin.js";

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * /setSuperAdmin:
 *   post:
 *     summary: Set a new super admin
 *     tags: 
 *       - SuperAdmin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Super admin created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post("/setSuperAdmin", SuperAdminController.Create_superAdmin);

export default router;