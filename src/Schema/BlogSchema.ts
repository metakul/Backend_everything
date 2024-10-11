import { z } from "zod";
import { BlogsStatusInfo } from "../DataTypes/enums/IUserEnums.js";

// Blog validation schema
export const BlogValidation = z.object({
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
  cryptoSymbol: z.string()
    .trim().nonempty({ message: "Crypto symbol is required" }),
  status: z.enum([BlogsStatusInfo.APPROVED, BlogsStatusInfo.PENDING, BlogsStatusInfo.REJECTED])
});

// Blog ID validation schema
export const BlogIdValidation = z.string()
  .trim()
  .min(1, { message: "Blog ID is required" })
  .regex(/^[a-zA-Z0-9]+$/, { message: "Blog ID must be alphanumeric" });

// Crypto ID validation schema
export const CryptoIdValidation = z.string()
  .trim().nonempty({ message: "Crypto ID is required" });

// Update Blog validation schema
export const UpdateBlogValidation = z.object({
  blogId: z.string()
    .trim()
    .min(1, { message: "Blog ID is required" })
    .regex(/^[a-zA-Z0-9]+$/, { message: "Blog ID must be alphanumeric" }),
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
  cryptoSymbol: z.string()
    .trim().nonempty({ message: "Crypto symbol is required" }),
  // status: z.enum([BlogsStatusInfo.APPROVED, BlogsStatusInfo.PENDING, BlogsStatusInfo.REJECTED])
});

// Update post status validation schema
export const UpdatePostStatusValidation = z.object({
  blogId: z.string()
    .trim()
    .min(1, { message: "Blog ID is required" })
    .regex(/^[a-zA-Z0-9]+$/, { message: "Blog ID must be alphanumeric" }),
  status: z.enum([BlogsStatusInfo.APPROVED, BlogsStatusInfo.PENDING, BlogsStatusInfo.REJECTED])
});
