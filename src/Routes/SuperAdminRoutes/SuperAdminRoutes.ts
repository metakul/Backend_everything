import express from "express";
import * as SuperAdminController from "../../Controllers/Post/SuperAdmin.js";

const router = express.Router({ mergeParams: true });


// super admin
router.post("/setSuperAdmin", SuperAdminController.Create_superAdmin)

export default router;