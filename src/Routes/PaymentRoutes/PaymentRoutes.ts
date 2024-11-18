import { Router } from "express";
import cors from "cors";
import checkJwt from "../../Middleware/checkJwt.js";
import * as PaymentController from "../../Controllers/Post/PaymentController.js";
import { UserCategory } from "../../DataTypes/enums/IUserEnums.js";

const router: Router = Router();
router.use(cors());

// Create payment order
router.post(
  "/payment/create",
  PaymentController.createPaymentOrder
);

// Fetch payment details by paymentId
router.get(
  "/payment/:paymentId",
  PaymentController.fetchPaymentDetails
);

// Handle payment success callback
// router.post("/success", PaymentController.paymentSuccess);

// Handle payment failure callback
// router.post("/failure", PaymentController.paymentFailed);

export default router;
