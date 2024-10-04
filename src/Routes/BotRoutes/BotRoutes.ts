// BotRoutes/BotRoutes.ts
import express from "express";
import * as BotController from "../../Controllers/Post/BotController.js";
// import CheckPermission from "../../Middleware/CheckPermission.js";
// import { ReadPermissionControl, UpdatePermissionControl } from "../../DataTypes/rbac/permission.js";
import checkJwt from "../../Middleware/checkJwt.js";
import dynamicMulter from "../../Middleware/multerConfig.js";

const router = express.Router({ mergeParams: true });

// Configure multer for bot creation
const botMulter = dynamicMulter('videos', ['.mp4', '.avi', '.mkv' , ".png"], 2048);
// POST request for creating a bot
router.post("/create_bot",
    checkJwt,
    // CheckPermission(CreatePermissionControl.can_create_credential),
    botMulter.single('botFile'), // Use multer for single file upload
    BotController.create_bot
);

// New route for retrieving bot files
router.get("/bots", checkJwt, BotController.get_bots);


// Add the routes in your Express application
router.put('/bots/:botId/pause',checkJwt, BotController.pause_bot); // Pause bot route
router.put('/bots/:botId/resume',checkJwt, BotController.resume_bot); // Resume bot route


// Assuming your bot routes are grouped together
router.put('/bots/:botId', BotController.update_bot); // Update bot route


export default router;
