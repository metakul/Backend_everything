import { Request, Response, NextFunction } from "express";
import Razorpay from "razorpay";
import { RequestWithUser } from "../../Middleware/checkJwt.js";
import { prisma } from "../../db/client.js";
import { ErrorEnum, PaymentError } from "../../DataTypes/enums/Error.js";
import { LoginUserRequest } from "../../Middleware/UserExist.js";
import { createShipment } from "../../Utils/scripts/DelhiveryAPI.js";

// Initialize Razorpay instance with public key (ensure you use environment variables in production)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret:process.env.RAZORPAY_KEY_SECRET
});

// /**
//  * Create a Razorpay payment order
//  * @param req
//  * @param res
//  * @param next
//  */
// export const createPaymentOrder = async (
//   req: RequestWithUser,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { amount, currency, receipt, notes } = req.body;

//     // Basic validation for amount and currency
//     if (!amount || !currency) {
//       throw PaymentError.InvalidPaymentDetails();
//     }

//     // Create Razorpay order
//     const options = {
//       amount: amount * 100, // Convert to paise (1 INR = 100 paise)
//       currency: currency || "INR",
//       receipt: receipt || `order_${Date.now()}`,
//       notes: notes || {},
//     };

//     const order = await razorpay.orders.create(options);
//     res.status(201).json(order);
//   } catch (error) {
//     next(error);
//   }
// };


/**
 * Add Razorpay Payment ID and Schedule Delivery
 * @param paymentId
 */
export const addPaymentId = async (
  req: LoginUserRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const userId = user?.id;

    if (!user) {
      throw ErrorEnum.InternalserverError("Error validating User");
    }

    const email = user.email;
    const { paymentId, orderDetails } = req.body;

    if (!paymentId) {
      throw PaymentError.InvalidPaymentDetails();
    }

    // Update Razorpay payment ID
    const updatedUser = await prisma.wiwusers.update({
      where: { email },
      data: {
        razorpayPayments: { push: paymentId },
      },
    });

    // Validate and schedule the delivery
    const {
      products,
      seller_details,
      warehouse_details,
      consignee,
      payment_mode,
    } = orderDetails;

    if (
      !products ||
      !seller_details ||
      !warehouse_details ||
      !consignee ||
      !payment_mode
    ) {
      throw new Error("Missing mandatory fields for scheduling delivery.");
    }

    const shipmentData = {
      title: `Shipment for Order ${paymentId}`,
      smses: [consignee.phone],
      emails: [seller_details.email],
      order_id: paymentId,
      language: "en",
      pickup_note: "Please contact our staff for pickup.",
      origin_city: warehouse_details.city,
      origin_state: warehouse_details.state,
      origin_postal_code: warehouse_details.pin,
      origin_country_iso3: "IND",
      origin_raw_location: `${warehouse_details.address}, ${warehouse_details.city}, ${warehouse_details.state}, ${warehouse_details.pin}, India`,
      destination_city: consignee.city,
      destination_state: consignee.state,
      destination_postal_code: consignee.pin,
      destination_country_iso3: "IND",
      destination_raw_location: `${consignee.address}, ${consignee.city}, ${consignee.state}, ${consignee.pin}, India`,
    };

    const payload = {
      tracking_number: `WhatIWear-${paymentId}`,
      pickup_location: warehouse_details.name,
      delivery_type: "pickup_at_store",
      order_promised_delivery_date: "2025-01-01",
      custom_fields: {
        fragile: "No",
        product_description: products
          .map((p: any) => `${p.quantity}x ${p.name}`)
          .join(", "),
        total_weight: products.reduce((sum: number, p: any) => sum + p.weight, 0),
      },
    };

    const shipmentResponse = await createShipment(shipmentData, payload);

    // Save tracking ID to wiwUsers and map with payment ID
    const trackingId = shipmentResponse.data.tracking.id;

    // Save the delivery instruction and link to the user
    const deliveryInstruction = await prisma.deliveryInstructions.create({
      data: {
        paymentId,
        trackingId,
        userId
       
      },
    });

    // Return response
    return res.status(200).json({
      message: "Payment ID added successfully and shipment scheduled",
      paymentDetails: updatedUser,
      shipmentDetails: shipmentResponse,
      deliveryInstruction,
    });
  } catch (error) {
    console.error("Error in addPaymentId:", error);
    return next(error);
  }
};




/**
 * Get Razorpay Payment IDs
 */
export const getPaymentIds = async (
  req: LoginUserRequest,
  res: Response,
  next: NextFunction
) => {
  try {
      const user = req.user;

      if (!user) {
          throw ErrorEnum.InternalserverError("Error validating User");
      }

      const phoneNumber = (user as any).phoneNumber;

      const userInfo = await prisma.wiwusers.findUnique({
          where: {phoneNumber: phoneNumber },
          select: {
              razorpayPayments: true, // Fetch only the Razorpay payments array
          },
      });


      return res.status(200).json({
          message: "Razorpay Payment IDs fetched successfully",
          data: userInfo,
          statusCode: 200,
      });
  } catch (error) {
      return next(error);
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

