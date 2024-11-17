import { DropShipIdValidation, DropShipValidation, CryptoIdValidation, UpdateDropShipValidation } from "../Schema/DropShipSchema.js"; 
import { MongooseError } from "../DataTypes/enums/Error.js";
import { logWithMessageAndStep } from "../Helpers/Logger/logger.js";
import { IdropShip, IUpadateDropShip } from "../DataTypes/interfaces/IDropShip.js";

export const DropShipValidationService = {
  async validateCreateDropShip(data: IdropShip) {

    const parsed = DropShipValidation.safeParse(data);
    if (parsed.success) {

      // If you have any specific fields that require processing, do it here
      // e.g. if you want to encrypt certain fields or modify data

      return parsed.data; // Return the validated and parsed data
    } else {
      throw MongooseError.InvalidDataTypes(parsed.error.issues[0].message, parsed.error.issues[0].path);
    }
  },

  async validateUpdateDropShip(data: IUpadateDropShip) {

    const parsed = UpdateDropShipValidation.safeParse(data);
    console.log("parsed",parsed);
    
    if (parsed.success) {
      
      return parsed.data; // Return the validated and parsed data
    } else {
      throw MongooseError.InvalidDataTypes(parsed.error.issues[0].message, parsed.error.issues[0].path);
    }
  }
};

// Example usage
export const UpdatePostStatusValidation = {
  async validateAsync(data: any) {

    const parsed = UpdateDropShipValidation.safeParse(data);
    if (parsed.success) {
      return parsed.data; // Return the validated data
    } else {
      throw MongooseError.InvalidDataTypes(parsed.error.issues[0].message, parsed.error.issues[0].path);
    }
  }
};


export const DropShipIdValidationService = {
  async validateDropShipId(data: any) {

    const parsed = DropShipIdValidation.safeParse(data);
    if (parsed.success) {
      return parsed.data; // Return the validated DropShip ID
    } else {
      throw MongooseError.InvalidDataTypes(parsed.error.issues[0].message, parsed.error.issues[0].path);
    }
  }
};


export const CryptoIdValidationService = {
  async validateCryptoId(data: any) {

    const parsed = CryptoIdValidation.safeParse(data);
    if (parsed.success) {
      return parsed.data; // Return the validated Crypto ID
    } else {
      throw MongooseError.InvalidDataTypes(parsed.error.issues[0].message, parsed.error.issues[0].path);
    }
  }
};