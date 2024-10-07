import express from "express";
import UserRoutes from './UserRoutes/UserRoutes.js';
import CommonRoutes from './CommonRoutes/CommonRoutes.js';
import SuperAdminRoutes from './SuperAdminRoutes/SuperAdminRoutes.js';
import RoleRoutes from './RolePermRoutes/RoleRoutes.js';
import PermissionRoutes from './RolePermRoutes/PermissionRoutes.js';
import BotRoutes from './BotRoutes/BotRoutes.js';
import BlogRoutes from './BlogRoutes/BlogRoutes.js';
import HardhatRoutes from './ContractRoutes/ContractRoutes.js';
import handleError from "../Middleware/error.js";
import { Request, Response, NextFunction } from "express";
import { MongooseError } from "../DataTypes/enums/Error.js";
import { isDatabaseHealthy } from "../db/client.js";

const router = express.Router({ mergeParams: true });

// Middleware to check Mongoose connection
const CheckPrismaConnection = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const isDatabseHealthy = await isDatabaseHealthy()
    if (isDatabseHealthy == false) {
      // Prisma is not connected
      throw MongooseError.DatabaseConnectionError();
    }
    next();
  } catch (error) {
    return next(error);
  }
};

// // user routes
router.use(
  "/V1",
  CheckPrismaConnection,
  // TODO ADD MIDDLEWARE
  UserRoutes
);

//system Admin Routes
router.use(
  "/V1",
  CheckPrismaConnection,
  SuperAdminRoutes
);

// common routes
router.use(
  "/V1",
  CheckPrismaConnection,
  CommonRoutes
);

router.use(
  "/V1",
  CheckPrismaConnection,
  RoleRoutes
);
router.use(
  "/V1",
  CheckPrismaConnection,
  PermissionRoutes
);
router.use(
  "/V1",
  CheckPrismaConnection,
  BlogRoutes
);
router.use(
  "/V1",
  CheckPrismaConnection,
  BotRoutes
);

router.use(
  "/V1",
  CheckPrismaConnection,
  HardhatRoutes
);

router.use(handleError)
export default router