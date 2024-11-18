import { Request, Response, NextFunction } from "express";
import Razorpay from "razorpay";
import { RequestWithUser } from "../../Middleware/checkJwt.js";
import { prisma } from "../../db/client.js";
import { PaymentError } from "../../DataTypes/enums/Error.js";

// Initialize Razorpay instance with public key (ensure you use environment variables in production)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret:process.env.RAZORPAY_KEY_SECRET
});

/**
 * Create a Razorpay payment order
 * @param req
 * @param res
 * @param next
 */
export const createPaymentOrder = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const { amount, currency, receipt, notes } = req.body;

    // Basic validation for amount and currency
    if (!amount || !currency) {
      throw PaymentError.InvalidPaymentDetails();
    }

    // Create Razorpay order
    const options = {
      amount: amount * 100, // Convert to paise (1 INR = 100 paise)
      currency: currency || "INR",
      receipt: receipt || `order_${Date.now()}`,
      notes: notes || {},
    };

    const order = await razorpay.orders.create(options);
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch payment details from Razorpay
 * @param req
 * @param res
 * @param next
 */
export const fetchPaymentDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const paymentId = req.params.paymentId;

    if (!paymentId) {
      throw PaymentError.InvalidPaymentDetails();
    }

    // Fetch payment details using Razorpay API
    const paymentDetails = await razorpay.payments.fetch(paymentId);
    
    console.log("paymentDetails",paymentDetails);

    res.status(200).json(paymentDetails);
  } catch (error) {
    console.log(error);
    
    next(error);
  }
};

/**
 * Handle successful payment callback
 * @param req
 * @param res
 * @param next
 */
// export const paymentSuccess = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { paymentId, orderId, signature } = req.body;

//     if (!paymentId || !orderId || !signature) {
//       throw PaymentError.InvalidPaymentDetails();
//     }

//     // Verifying the payment signature using Razorpay
//     const isSignatureValid = razorpay.utils.verifyPaymentSignature({
//       payment_id: paymentId,
//       order_id: orderId,
//       signature,
//     });

//     if (!isSignatureValid) {
//       throw PaymentError.InvalidSignature();
//     }

//     // Save payment details to your database (for record keeping)
//     const paymentData = {
//       paymentId,
//       orderId,
//       status: "Success",
//       amount: req.body.amount,
//       currency: req.body.currency,
//     };

//     // Insert into database (you can adapt this to your schema)
//     const savedPayment = await prisma.payment.create({
//       data: paymentData,
//     });

//     res.status(200).json(savedPayment);
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * Handle failed payment callback
//  * @param req
//  * @param res
//  * @param next
//  */
// export const paymentFailed = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { paymentId, orderId, signature } = req.body;

//     if (!paymentId || !orderId || !signature) {
//       throw PaymentError.InvalidPaymentDetails();
//     }

//     // Log failed payment or handle accordingly
//     const paymentFailureData = {
//       paymentId,
//       orderId,
//       signature,
//       status: "Failed",
//     };

//     // Insert into the database for failure tracking (optional)
//     const failedPayment = await prisma.payment.create({
//       data: paymentFailureData,
//     });

//     res.status(200).json(failedPayment);
//   } catch (error) {
//     next(error);
//   }
// };
