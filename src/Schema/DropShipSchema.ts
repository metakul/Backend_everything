import { z } from "zod";
import { DropShipsStatusInfo } from "../DataTypes/enums/IUserEnums.js";

// DropShip validation schema
export const DropShipValidation = z.object({
  title: z.string()
    .min(6, { message: "Title must be at least 6 characters long" })
    .trim().nonempty({ message: "Title is required" }),
  description: z.string()
    .trim().nonempty({ message: "Description is required" }),
  image: z.string()
    .trim().nonempty({ message: "Image is required" }),
  author: z.string()
    .min(4, { message: "Author name must be at least 4 characters long" })
    .trim().nonempty({ message: "Author is required" }),
  categories: z.array(z.string())
    .nonempty({ message: "Categories are required" }),
  price: z.number()
    .positive({ message: "Price must be a positive number" })
    .nonnegative({ message: "Price must not be negative" }),
  totalItemRemaining: z.number()
    .int({ message: "Total items remaining must be an integer" })
    .nonnegative({ message: "Total items remaining must not be negative" }),
  sizes: z.array(z.object({
    sizeName: z.string().nonempty({ message: "Size name is required" }),
    totalItems: z.number()
      .int({ message: "Total items must be an integer" })
      .nonnegative({ message: "Total items must not be negative" }),
  })).nonempty({ message: "Sizes are required" }),
  status: z.enum([DropShipsStatusInfo.APPROVED, DropShipsStatusInfo.PENDING, DropShipsStatusInfo.REJECTED])
});

// DropShip ID validation schema
export const DropShipIdValidation = z.string()
  .trim()
  .min(1, { message: "DropShip ID is required" })
  .regex(/^[a-zA-Z0-9]+$/, { message: "DropShip ID must be alphanumeric" });

// Crypto ID validation schema
export const CryptoIdValidation = z.string()
  .trim().nonempty({ message: "Crypto ID is required" });

// Update DropShip validation schema
export const UpdateDropShipValidation = z.object({
  dropShipItemsId: z.string()
    .trim()
    .min(1, { message: "DropShip ID is required" })
    .regex(/^[a-zA-Z0-9]+$/, { message: "DropShip ID must be alphanumeric" }),
  title: z.string()
    .min(6, { message: "Title must be at least 6 characters long" })
    .trim().nonempty({ message: "Title is required" }),
  description: z.string()
    .trim().nonempty({ message: "Description is required" }),
  image: z.string()
    .trim().nonempty({ message: "Image is required" }),
  author: z.string()
    .min(4, { message: "Author name must be at least 4 characters long" })
    .trim().nonempty({ message: "Author is required" }),
  categories: z.array(z.string())
    .nonempty({ message: "Categories are required" }),
    price: z.number()
    .positive({ message: "Price must be a positive number" })
    .nonnegative({ message: "Price must not be negative" }),
  sizes: z.array(z.object({
    id: z.string()
    .trim()
    .regex(/^[a-zA-Z0-9]+$/, { message: "DropShip ID must be alphanumeric" }),
    sizeName: z.string().nonempty({ message: "Size name is required" }),
    totalItems: z.number()
      .int({ message: "Total items must be an integer" })
      .nonnegative({ message: "Total items must not be negative" }),
  })).nonempty({ message: "Sizes are required" }),
  totalItemRemaining: z.number()
    .int({ message: "Total items remaining must be an integer" })
    .nonnegative({ message: "Total items remaining must not be negative" }),
  // status: z.enum([DropShipsStatusInfo.APPROVED, DropShipsStatusInfo.PENDING, DropShipsStatusInfo.REJECTED])
});

// Update post status validation schema
export const UpdatePostStatusValidation = z.object({
  dropShipItemsId: z.string()
    .trim()
    .min(1, { message: "DropShip ID is required" })
    .regex(/^[a-zA-Z0-9]+$/, { message: "DropShip ID must be alphanumeric" }),
  status: z.enum([DropShipsStatusInfo.APPROVED, DropShipsStatusInfo.PENDING, DropShipsStatusInfo.REJECTED])
});
