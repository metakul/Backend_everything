import express from "express";
// import { checkUserExists } from "../../Middleware/UserExist.js";
// import { checkUserCategoryExists } from "../../Middleware/IfUserCategoryExist.js";
// import { ValidateApiKey } from "../../Middleware/ValidateApiKey.js";
import checkJwt from "../../Middleware/checkJwt.js";
import * as DheliverController from "../../Controllers/Post/DheliverController.js";
import { UserCategory } from "../../DataTypes/enums/IUserEnums.js";

const router = express.Router({ mergeParams: true });

// router.post(
//     "/dhelivery/create",
//     // checkJwt([UserCategory.Verifier, UserCategory.Holder, UserCategory.User, UserCategory.SUPER_ADMIN, UserCategory.ROADIES_SUPER_ADMIN]),
//     // checkUserCategoryExists,
//     DheliverController.scheduleDelivery
//   );
router.get(
    "/dhelivery/get/:trackingId",
    // checkJwt([UserCategory.Verifier, UserCategory.Holder, UserCategory.User, UserCategory.SUPER_ADMIN, UserCategory.ROADIES_SUPER_ADMIN]),
    // checkUserCategoryExists,
    DheliverController.getTrackingDetails
  );

router.get(
    "/dhelivery/get",
    checkJwt([UserCategory.Verifier, UserCategory.Holder, UserCategory.User, UserCategory.SUPER_ADMIN, UserCategory.ROADIES_SUPER_ADMIN]),
    // checkUserCategoryExists,
    DheliverController.fetchDeliveryInstructions
  );
  
export default router;
