// routes/roleRoutes.ts
import express from 'express';
import { getRoles, createRole, updateRole, assignRole } from '../../Controllers/RoleController/RoleController.js';
import { IfSuperAdmin } from '../../Middleware/IfSuperAdmin.js'; 
import CheckPermission from "../../Middleware/CheckPermission.js"
import { CreatePermissionControl, ReadPermissionControl, UpdatePermissionControl } from '../../DataTypes/rbac/permission.js';
import checkJwt from '../../Middleware/checkJwt.js';
import { UserCategory } from '../../DataTypes/enums/IUserEnums.js';
const router = express.Router();

// Fetch all roles
router.get('/roles',checkJwt([UserCategory.SUPER_ADMIN]), IfSuperAdmin, CheckPermission(ReadPermissionControl.view_roles), getRoles);

// Create a new role
router.post('/roles',checkJwt([UserCategory.SUPER_ADMIN]), IfSuperAdmin, CheckPermission(CreatePermissionControl.create_role), createRole);

// Update a role's permissions
router.put('/roles',checkJwt([UserCategory.SUPER_ADMIN]), IfSuperAdmin, CheckPermission(UpdatePermissionControl.update_role ), updateRole);

// Assign a role to a user
router.post('/assignRole',checkJwt([UserCategory.SUPER_ADMIN]), IfSuperAdmin, CheckPermission(CreatePermissionControl.assign_role), assignRole);

export default router;
