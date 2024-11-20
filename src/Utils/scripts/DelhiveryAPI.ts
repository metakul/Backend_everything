import axios from "axios";

interface ShipmentData {
  title?: string;
  order_id?: string;
  order_number?: string;
  customer_name?: string;
  emails?: string[];
  smses?: string[];
}

interface Payload {
  tracking_number: string;
  origin?: string;
  destination?: string;
  [key: string]: any;
}

/**
 * Creates a shipment using the DTDC API via AfterShip
 * @param {ShipmentData} shipmentData - The shipment data to send
 * @param {Payload} payload - Additional payload details
 * @returns The response from the DTDC API
 */
export const createShipment = async (shipmentData: ShipmentData, payload: Payload) => {
  try {
    const url = "https://api.aftership.com/v4/trackings";
    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Aftership-Api-Key": process.env.AFTERSHIP_API_KEY,
    };

    if (!headers["Aftership-Api-Key"]) {
      throw new Error("Missing Aftership API Key in environment variables");
    }

    const trackingPayload = {
      tracking: {
        slug: "dtdc",
        ...shipmentData,
        ...payload,
      },
    };

    const response = await axios.post(url, trackingPayload, { headers });
    return response.data;
  } catch (error) {
    console.error("Error creating shipment:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(JSON.stringify(error.response.data));
    } else {
      throw new Error("Error creating shipment: " );
    }
  }
};

/**
 * Predicts delivery dates using AfterShip API
 * @param {any} payload - Payload for the delivery prediction
 * @returns The response from the AfterShip API
 */
export const predictDeliveryDates = async (payload: any) => {
  try {
    const url = "https://api.aftership.com/v4/estimated-delivery-date/predict-batch";
    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Aftership-Api-Key": process.env.AFTERSHIP_API_KEY,
    };

    if (!headers["Aftership-Api-Key"]) {
      throw new Error("Missing Aftership API Key in environment variables");
    }

    const response = await axios.post(url, payload, { headers });
    return response.data;
  } catch (error) {
    console.error("Error predicting delivery dates:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(JSON.stringify(error.response.data));
    } else {
      throw new Error("Error predicting delivery dates: " + error);
    }
  }
};

/**
 * Gets tracking information using AfterShip API
 * @param {string} trackingId - The tracking ID to fetch information for
 * @returns The response from the AfterShip API
 */
export const getTrackingInfo = async (trackingId: string) => {
  try {
    const url = `https://api.aftership.com/tracking/2024-10/trackings/${trackingId}`;
    const headers = {
      "Content-Type": "application/json",
      "as-api-key": process.env.AFTERSHIP_API_KEY,
    };

    const response = await axios.get(url, { headers });

    return response.data;
  } catch (error) {
    console.error("Error getting tracking information:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(JSON.stringify(error.response.data));
    } else {
      throw new Error("Error getting tracking information: " + error);
    }
  }
};