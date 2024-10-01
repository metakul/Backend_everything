import express from "express";
import * as UserPostController from "../../Controllers/Post/UserPostController.js";
import * as UserGetController from "../../Controllers/Get/UserGetController.js";
import CheckPermission from "../../Middleware/CheckPermission.js";
import { ReadPermissionControl, UpdatePermissionControl } from "../../DataTypes/rbac/permission.js";
import checkJwt from "../../Middleware/checkJwt.js";

const router = express.Router({ mergeParams: true });

// todo add checkJwt requirement
// create user
router.post("/register", UserPostController.register);

//get users
router.get("/orgList",
    checkJwt,
    CheckPermission(ReadPermissionControl.can_read_orgList),
    UserGetController.orgList);

// patch
router.patch("/updateOrg",
    checkJwt,
    CheckPermission(UpdatePermissionControl.can_update_org),
    UserPostController.updateUser)
export default router;