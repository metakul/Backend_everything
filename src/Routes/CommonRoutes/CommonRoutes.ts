import express from "express";
import { checkUserExists } from "../../Middleware/UserExist.js";
import { checkUserCategoryExists } from "../../Middleware/IfUserCategoryExist.js";
import { ValidateApiKey } from "../../Middleware/ValidateApiKey.js";
import CheckPermission from "../../Middleware/CheckPermission.js";
import { ReadPermissionControl } from "../../DataTypes/rbac/permission.js";
import checkJwt from "../../Middleware/checkJwt.js";
import * as CommonController from "../../Controllers/Post/CommonPostController.js";
import * as CommonGetController from "../../Controllers/Get/CommonGetController.js";

const router = express.Router({ mergeParams: true });

router.post("/login",
    checkUserExists,
    checkUserCategoryExists,
    CommonController.login);

// get Profile
router.get("/profile",
    checkJwt,
    ValidateApiKey,
    CheckPermission(ReadPermissionControl.can_read_profile),
    checkUserCategoryExists,
    CommonGetController.profile);

export default router;
