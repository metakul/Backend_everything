import express from "express";
import * as RandomController from "../../Controllers/Post/RandomController.js";

const router = express.Router({ mergeParams: true });

router.post(
    "/increaseTotalDownloadCount",
    RandomController.incrementDownloadCount
);

export default router;
