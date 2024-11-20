import express from "express";
import { checkUserExists } from "../../Middleware/UserExist.js";
import { checkUserCategoryExists } from "../../Middleware/IfUserCategoryExist.js";
// import { ValidateApiKey } from "../../Middleware/ValidateApiKey.js";
import checkJwt from "../../Middleware/checkJwt.js";
import * as DheliverController from "../../Controllers/Post/DheliverController.js";
import { UserCategory } from "../../DataTypes/enums/IUserEnums.js";

const router = express.Router({ mergeParams: true });
/**
 * @swagger
 * /dhelivery/create:
 *   get:
 *     summary: Schedule a delivery
 *     description: Schedule a delivery using the Delhivery API. Requires valid user authentication and authorization.
 *     tags: 
 *       - Dhelivery
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *         required: true
 *         description: Bearer token for authentication.
 *     responses:
 *       200:
 *         description: Delivery scheduled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Shipment created successfully"
 *                 shipmentDetails:
 *                   type: object
 *                   description: Details of the created shipment
 *       400:
 *         description: Bad request, invalid input parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing mandatory fields"
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       403:
 *         description: Forbidden, insufficient permissions
 *       500:
 *         description: Internal server error
 */

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
