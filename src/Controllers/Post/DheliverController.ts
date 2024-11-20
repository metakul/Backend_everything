import { Request, Response, NextFunction } from "express";
import { createShipment, predictDeliveryDates, getTrackingInfo } from "../../Utils/scripts/DelhiveryAPI.js"; // Importing the predictDeliveryDates function
import { LoginUserRequest } from "src/Middleware/UserExist.js";
import { prisma } from "../../db/client.js";
import { ErrorEnum } from "../..//DataTypes/enums/Error.js";

/**
 * Schedule Delivery Controller
 * Handles the creation of a shipment using the DTDC API.
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next middleware function
 */
export const scheduleDelivery = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      order_id,
      products,
      seller_details,
      warehouse_details,
      consignee,
      payment_mode,
      // package_type,
      // shipment_value,
      // fragile_shipment,
      // gst_details,
    } = req.body;

    // Validate mandatory fields
    if (
      !order_id ||
      !products ||
      !seller_details ||
      !warehouse_details ||
      !consignee ||
      !payment_mode
    ) {
      return res.status(400).json({ error: "Missing mandatory fields" });
    }

    // Prepare the shipment data
    const shipmentData = {
      title: `Shipment for Order ${order_id}`,
      smses: [consignee.phone],
      emails: [seller_details.email],
      order_id,
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

    // Prepare the payload for delivery date prediction
    const deliveryPayload = {
      estimated_delivery_dates: [
        {
          slug: "dtdc",
          service_type_name: "Standard", // Adjust if needed
          origin_address: {
            country: "India",
            state: warehouse_details.state,
            city: warehouse_details.city,
            postal_code: warehouse_details.pin,
            raw_location: `${warehouse_details.address}, ${warehouse_details.city}, ${warehouse_details.state}, ${warehouse_details.pin}, India`
          },
          destination_address: {
            country: "India",
            state: consignee.state,
            postal_code: consignee.pin,
            raw_location: `${consignee.address}, ${consignee.city}, ${consignee.state}, ${consignee.pin}, India`
          },
          weight: {
            unit: "kg",
            value: products.reduce((sum: number, p: any) => sum + p.weight, 0)
          },
          package_count: products.length,
        }
      ]
    };

    // Call the delivery date prediction API
    // const deliveryPrediction = await predictDeliveryDates(deliveryPayload);

    // Check if the prediction is successful and set the order promised delivery date
    // const estimatedDeliveryDate = deliveryPrediction.estimated_delivery_dates[0]?.predicted_delivery_date || "2024-12-12"; // Fallback to default if not available

    // console.log(estimatedDeliveryDate);
    
    // Prepare additional payload

    const payload = {
      tracking_number: `TRK-${order_id}`,
      pickup_location: warehouse_details.name,
      delivery_type: "pickup_at_store",
      order_promised_delivery_date: "2025-01-01",
      custom_fields: {
        // fragile: fragile_shipment ? "Yes" : "No",
        fragile:  "No",
        product_description: products.map((p: any) => `${p.quantity}x ${p.name}`).join(", "),
        total_weight: products.reduce((sum: number, p: any) => sum + p.weight, 0),
      },
    };
    // Call DTDC API to create the shipment
    const shipmentResponse = await createShipment(shipmentData, payload);

    // Send response back to the client
    res.status(201).json({
      message: "Shipment created successfully",
      shipmentDetails: shipmentResponse,
      // orderPromisedDeliveryDate: estimatedDeliveryDate, // Send the estimated delivery date in the response
    });
  } catch (error) {
    console.error("Error scheduling delivery:", error);
    next(error); // Pass the error to the next middleware
  }
};
/**
 * Get Tracking Details Controller
 * Handles fetching tracking information using the AfterShip API.
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next middleware function
 */
export const getTrackingDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { trackingId } = req.params;

    if (!trackingId) {
      return res.status(400).json({ error: "Missing tracking ID" });
    }

    // Call AfterShip API to get tracking information
    const trackingInfo = await getTrackingInfo(trackingId);

    // Send response back to the client
    res.status(200).json({
      message: "Tracking information fetched successfully",
      trackingInfo: trackingInfo,
    });
  } catch (error) {
    console.error("Error fetching tracking information:", error);
    next(error); // Pass the error to the next middleware
  }
};


// wareHouse creation:
// curl --request POST \
//      --url "https://staging-express.delhivery.com/api/backend/clientwarehouse/create/" \
//      --header "Content-Type:application/json"\
//      --header "Accept:application/json"\
//      --header "Authorization: Token api-token-key Pass Token as 'Token XXXXXXXXXXXXXXXXXX'" \
//  --data '{
//       "name": "Roadies",
//       "email": "shubhamkunwar10feb@gmail.com",
//       "phone": "7310747066",
//       "address": "Roadies, Gurudwara Road, Srinagar garhwal",
//       "city": "Srinagar",
//       "country": "India",
//       "pin": "246174",
//       "return_address": "Roadies, Gurudwara Road, Srinagar garhwal",
//       "return_pin": "246174",
//       "return_city": "Srinagar",
//       "return_state": "uttarakhand",
//       "return_country": "India"
// }'





// fetch all bills

// curl --request GET \
//      --url "https://staging-express.delhivery.com/waybill/api/bulk/json/?count=010" \
//      --header "Content-Type:application/json"\
//      --header "Authorization: Token api-token-key Pass Token as 'Token XXXXXXXXXXXXXXXXXX'" \
 

// create delivery
// curl --request POST \
//      --url "https://staging-express.delhivery.com/api/cmu/create.json" \
//      --header "Content-Type:application/json"\
//      --header "Accept:application/json"\
//      --header "Authorization: Token api-token-key Pass Token as 'Token XXXXXXXXXXXXXXXXXX'" \
//  --data 'format=json&data={
//   "shipments": [
//     {
//       "name": "Shivam Rangarh",
//       "add": "Kanpur",
//       "pin": "208016",
//       "city": "Kanpur",
//       "state": "Uttar Pradesh",
//       "country": "India",
//       "phone": "7895171747",
//       "order": "PaymentIDfromFromRajorPay",
//       "payment_mode": "Prepaid",
//       "return_pin": "",
//       "return_city": "",
//       "return_phone": "",
//       "return_add": "",
//       "return_state": "",
//       "return_country": "",
//       "products_desc": "3x Shirt, 2 xjacket",
//       "hsn_code": "",
//       "cod_amount": "",
//       "order_date": null,
//       "total_amount": "",
//       "seller_add": "",
//       "seller_name": "",
//       "seller_inv": "",
//       "quantity": "",
//       "waybill": "",
//       "shipment_width": "200",
//       "shipment_height": "200",
//       "weight": "",
//       "seller_gst_tin": "",
//       "shipping_mode": "Express",
//       "address_type": "home"
//     }
//   ],
//   "pickup_location": {
//     "name": "Roadies",
//     "add": "Roadies, Gurudwara Road",
//     "city": "Dehradun",
//     "pin_code": 248001,
//     "country": "India",
//     "phone": "9720535559"
//   }
// }'




//track bill


// curl --request GET \
//      --url "https://staging-express.delhivery.com/api/v1/packages/json/?waybill=84108410000151&ref_ids=" \
//      --header "Content-Type:application/json"\
//      --header "Authorization: Token api-token-key Pass Token as 'Token XXXXXXXXXXXXXXXXXX'" \
 

// {
//   "ShipmentData": [
//     {
//       "Shipment": {
//         "AWB": "84108410000151",
//         "CODAmount": 0,
//         "ChargedWeight": null,
//         "Consignee": {
//           "Address1": [],
//           "Address2": [],
//           "Address3": "",
//           "City": "",
//           "Country": "India",
//           "Name": "Shubham",
//           "PinCode": 208016,
//           "State": "",
//           "Telephone1": "",
//           "Telephone2": ""
//         },
//         "DeliveryDate": null,
//         "DestRecieveDate": null,
//         "Destination": "",
//         "DispatchCount": 0,
//         "Ewaybill": [],
//         "ExpectedDeliveryDate": null,
//         "Extras": "",
//         "FirstAttemptDate": null,
//         "InvoiceAmount": 0,
//         "OrderType": "Pre-paid",
//         "Origin": "Dehradun (Uttarakhand)",
//         "OriginRecieveDate": null,
//         "OutDestinationDate": null,
//         "PickUpDate": "2024-11-19T22:51:30.415",
//         "PickedupDate": null,
//         "PickupLocation": "Roadies",
//         "PromisedDeliveryDate": null,
//         "Quantity": "",
//         "RTOStartedDate": null,
//         "ReferenceNo": "myorder",
//         "ReturnPromisedDeliveryDate": null,
//         "ReturnedDate": null,
//         "ReverseInTransit": false,
//         "Scans": [
//           {
//             "ScanDetail": {
//               "Instructions": "Manifest uploaded",
//               "Scan": "Manifested",
//               "ScanDateTime": "2024-11-19T22:51:30.446",
//               "ScanType": "UD",
//               "ScannedLocation": "Dehradun (Uttarakhand)",
//               "StatusCode": "X-UCI",
//               "StatusDateTime": "2024-11-19T22:51:30.446"
//             }
//           }
//         ],
//         "SenderName": "d78e5e-WhatIWear-do-cdp",
//         "Status": {
//           "Instructions": "Manifest uploaded",
//           "RecievedBy": "",
//           "Status": "Manifested",
//           "StatusCode": "X-UCI",
//           "StatusDateTime": "2024-11-19T22:51:30.446",
//           "StatusLocation": "Dehradun (Uttarakhand)",
//           "StatusType": "UD"
//         }
//       }
//     }
//   ]
// }

/**
 * Fetch delivery instructions for a user or all
 * @param req
 * @param res
 * @param next
 */
export const fetchDeliveryInstructions = async (
  req: LoginUserRequest, // Includes `req.user` for authenticated requests
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const userId = user?.id; 
    const fetchAll = req.query.fetchAll === "true"; // Optional query param to fetch all

    console.log(userId);
    
    let deliveryInstructions;

    if (fetchAll) {
      // Fetch all delivery instructions with all related user details
      deliveryInstructions = await prisma.deliveryInstructions.findMany({
      });
    } else if (userId) {
      // Fetch delivery instructions for a specific user with all related user details
      deliveryInstructions = await prisma.deliveryInstructions.findMany({
        where: { userId }, // Filter by userId
      });
    } else {
      throw ErrorEnum.InvalidInput("Missing user or fetchAll parameter.");
    }

    return res.status(200).json({
      message: "Delivery instructions fetched successfully.",
      data: deliveryInstructions,
      statusCode: 200,
    });
  } catch (error) {
    console.error("Error fetching delivery instructions:", error);
    return next(error);
  }
};