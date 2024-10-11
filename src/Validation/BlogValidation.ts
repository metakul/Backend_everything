import { BlogIdValidation, BlogValidation, CryptoIdValidation, UpdateBlogValidation } from "../Schema/BlogSchema.js"; 
import { MongooseError } from "../DataTypes/enums/Error.js";
import { logWithMessageAndStep } from "../Helpers/Logger/logger.js";
import { Iblog, IUpadateBlog } from "../DataTypes/interfaces/IBlog.js";

export const BlogValidationService = {
  async validateCreateBlog(data: Iblog) {

    const parsed = BlogValidation.safeParse(data);
    if (parsed.success) {

      // If you have any specific fields that require processing, do it here
      // e.g. if you want to encrypt certain fields or modify data

      return parsed.data; // Return the validated and parsed data
    } else {
      throw MongooseError.InvalidDataTypes(parsed.error.issues[0].message, parsed.error.issues[0].path);
    }
  },

  async validateUpdateBlog(data: IUpadateBlog) {

    const parsed = UpdateBlogValidation.safeParse(data);
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

    const parsed = UpdateBlogValidation.safeParse(data);
    if (parsed.success) {
      return parsed.data; // Return the validated data
    } else {
      throw MongooseError.InvalidDataTypes(parsed.error.issues[0].message, parsed.error.issues[0].path);
    }
  }
};


export const BlogIdValidationService = {
  async validateBlogId(data: any) {

    const parsed = BlogIdValidation.safeParse(data);
    if (parsed.success) {
      return parsed.data; // Return the validated Blog ID
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