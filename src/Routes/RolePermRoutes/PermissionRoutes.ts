// routes/roleRoutes.ts
import express from 'express';
import { IfSuperAdmin } from '../../Middleware/IfSuperAdmin.js'; 
import CheckPermission from "../../Middleware/CheckPermission.js"
import {  ReadPermissionControl, } from '../../DataTypes/rbac/permission.js';
import { getPermissions } from '../../Controllers/RoleController/PermissionController.js';
import checkJwt from '../../Middleware/checkJwt.js';
const router = express.Router();

// Fetch all permission
router.get('/permissions',checkJwt, IfSuperAdmin, CheckPermission(ReadPermissionControl.view_permission), getPermissions);


export default router;
