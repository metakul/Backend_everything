import express from "express";
import { checkUserExists } from "../../Middleware/UserExist.js";
import { checkUserCategoryExists } from "../../Middleware/IfUserCategoryExist.js";
// import { ValidateApiKey } from "../../Middleware/ValidateApiKey.js";
import CheckPermission from "../../Middleware/CheckPermission.js";
import { ReadPermissionControl } from "../../DataTypes/rbac/permission.js";
import checkJwt from "../../Middleware/checkJwt.js";
import * as CommonController from "../../Controllers/Post/CommonPostController.js";
import * as CommonGetController from "../../Controllers/Get/CommonGetController.js";
import { checkIdentifier } from "../../Middleware/CheckIdentifier.js";

const router = express.Router({ mergeParams: true });

router.post("/login",
    (req, res, next) => {
        const identifierType = req.body.phoneNumber ? 'phoneNumber' : 'email';
        checkUserExists(req, res, next, identifierType);
    },
    checkUserCategoryExists,
    CommonController.login);

// get Profile
router.get("/profile",
    checkJwt,
    // ValidateApiKey,
    CheckPermission(ReadPermissionControl.can_read_profile),
    checkUserCategoryExists,
    CommonGetController.profile);

// get Profile
router.get("/profile",
    checkJwt,
    // (req, res, next) => {
    //     const identifierType = req.query.phoneNumber ? 'phoneNumber' : 'email';
    //     ValidateApiKey(req, res, next, identifierType);
    // },
    checkUserCategoryExists,
    // CheckPermission(ReadPermissionControl.can_read_profile),
    CommonGetController.profile);

// refresh Access Token 
router.post("/refreshLoginToken",
    CommonController.refreshLoginToken);

// Send OTP route
router.post("/sendOtp", (req, res, next) => {
    const identifierType = req.body.phoneNumber ? 'phoneNumber' : 'email';
    checkUserExists(req, res, next, identifierType);
}, CommonController.sendOtp);

// Verify OTP route
router.post("/verifyOtp", (req, res, next) => {
    const identifierType = req.body.phoneNumber ? 'phoneNumber' : 'email';
    checkUserExists(req, res, next, identifierType);
}, CommonController.verifyOtp);

// Resend OTP route
router.post("/resendOtp", (req, res, next) => {
    const identifierType = req.body.phoneNumber ? 'phoneNumber' : 'email';
    checkUserExists(req, res, next, identifierType);
}, CommonController.resendOtp);

// reset User Password
router.post("/resetPassword", (req, res, next) => {
    const identifierType = req.body.phoneNumber ? 'phoneNumber' : 'email';
    checkIdentifier(req, res, next, identifierType);
}, CommonController.resetPassword);

router.patch("/verifyResetPassword", (req, res, next) => {
    const identifierType = req.body.phoneNumber ? 'phoneNumber' : 'email';
    checkIdentifier(req, res, next, identifierType);
}, CommonController.verifyResetPassword);

//update password
router.patch("/updatePassword", checkJwt,
    // (req, res, next) => {
    //     const identifierType = req.body.phoneNumber ? 'phoneNumber' : 'email';
    //     ValidateApiKey(req, res, next, identifierType);
    // },
     CommonController.updatePassword);

export default router;