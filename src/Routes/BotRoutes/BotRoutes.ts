import express from "express";
import * as UserPostController from "../../Controllers/Post/UserPostController.js";
import * as UserGetController from "../../Controllers/Get/UserGetController.js";
import CheckPermission from "../../Middleware/CheckPermission.js";
import { ReadPermissionControl, UpdatePermissionControl } from "../../DataTypes/rbac/permission.js";
import checkJwt from "../../Middleware/checkJwt.js";

const router = express.Router({ mergeParams: true });


// post request
// router.post("/createIdentifier", UserPostController.create_Identifier);// moved inside updateOrg approval api
router.post("/create_bot",
    // CheckPermission(CreatePermissionControl.can_create_credential),
    UserPostController.create_bot);


export default router;