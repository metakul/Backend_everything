
import { z } from "zod";

export const InitSuperAdminSchema =z.object({
  email:z.string(),
  password:z.string(),
  name:z.string()
})

export const RegisterUserSchema=z.object({
    email:z.string(),
    password:z.string(),
    accountStatus:z.string(),
    name:z.string(),
    phoneNumber:z.string(),
    address:z.string(),
    category:z.string(),
})

export const UserUpdateScehma = z.object({
  email: z.string(),
  accountStatus: z.string(),
});

export const LoginUser = z.object({
  email:z.string(),
  password:z.string()
})