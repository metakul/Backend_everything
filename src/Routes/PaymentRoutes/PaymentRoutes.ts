import { Router } from "express";
import cors from "cors";
import checkJwt from "../../Middleware/checkJwt.js";
import * as PaymentController from "../../Controllers/Post/PaymentController.js";
import { UserCategory } from "../../DataTypes/enums/IUserEnums.js";
import { checkUserCategoryExists } from "../../Middleware/IfUserCategoryExist.js";

const router: Router = Router();
router.use(cors());

// Create payment order
// router.post(
//   "/payment/create",
//   PaymentController.createPaymentOrder
// );

// Fetch payment details by paymentId
router.get(
  "/payment/:paymentId",
  PaymentController.fetchPaymentDetails
);


/**
 * @swagger
 * /payments/add:
 *   post:
 *     summary: Add a Razorpay Payment ID to the user's profile
 *     tags: 
 *       - Payments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentId:
 *                 type: string
 *                 description: The Razorpay Payment ID to be added
 *     responses:
 *       200:
 *         description: Payment ID added successfully
 *       400:
 *         description: Bad Request (e.g., Payment ID not provided)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post(
  "/payments/add",
  checkJwt([UserCategory.Verifier, UserCategory.Holder, UserCategory.User,UserCategory.SUPER_ADMIN,UserCategory.ROADIES_SUPER_ADMIN]),

  checkUserCategoryExists,
  PaymentController.addPaymentId
);

/**
* @swagger
* /payments/get:
*   get:
*     summary: Get all Razorpay Payment IDs associated with the user's profile
*     tags: 
*       - Payments
*     responses:
*       200:
*         description: Payment IDs retrieved successfully
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 message:
*                   type: string
*                   example: Razorpay Payment IDs fetched successfully
*                 data:
*                   type: array
*                   items:
*                     type: string
*                     description: A list of Razorpay Payment IDs
*       401:
*         description: Unauthorized
*       404:
*         description: User not found
*       500:
*         description: Internal server error
*/
router.get(
  "/payments/get",
  checkJwt([UserCategory.Verifier, UserCategory.Holder, UserCategory.User,UserCategory.SUPER_ADMIN,UserCategory.ROADIES_SUPER_ADMIN]),

  checkUserCategoryExists,
  PaymentController.getPaymentIds
);


// Handle payment success callback
// router.post("/success", PaymentController.paymentSuccess);

// Handle payment failure callback
// router.post("/failure", PaymentController.paymentFailed);

export default router;
