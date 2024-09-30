import { PrismaClient } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { RequestWithUser } from '../../Middleware/checkJwt.js';
import { RoleErrors } from '../../DataTypes/enums/Error.js';
import { getPermissionsData } from '../../DataTypes/rbac/permission.js';
import { Permissions } from '../../DataTypes/interfaces/IUser.js';

const permissionsData: Permissions = getPermissionsData();

const prisma = new PrismaClient();


// Function to validate permissions
const validatePermissions = (permissions: string[]) => {
  // Check if each permission is valid
  permissions.forEach((perm: string) => {
      let isValid = false;

      if (permissionsData.createPermissions[perm]) {
          isValid = true;
      } else if (permissionsData.readPermissions[perm]) {
          isValid = true;
      } else if (permissionsData.updatePermissions[perm]) {
          isValid = true;
      } else if (permissionsData.deletePermissions[perm]) {
          isValid = true;
      }

      if (!isValid) {
          throw RoleErrors.InvalidPermissions();
      }
  });
};


export const getRoles = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
) => {
    try {
        const roles = await prisma.role.findMany();
        res.status(200).json({
            message: "Roles retrieved successfully",
            data: roles,
            statusCode: 200
        });
    } catch (error) {
        next(error);
    }
};

export const createRole = async (req: Request, res: Response, next: NextFunction) => {
  const { roleName, permissions } = req.body;

  try {
      // Validate permissions
      validatePermissions(permissions);

      const newRole = await prisma.role.create({
          data: {
              roleName,
              permissions,
          },
      });

      res.status(201).json({
          message: "Role created successfully",
          data: newRole,
          statusCode: 201
      });
  } catch (error) {
      next(error);
  }
};

export const updateRole = async (req: Request, res: Response, next: NextFunction) => {
  const { id,  permissions } = req.body;

  try {
      // Validate permissions
      validatePermissions(permissions);

      const updatedRole = await prisma.role.update({
          where: { id },
          data: {
              permissions,
          },
      });

      res.status(200).json({
          message: "Role updated successfully",
          data: updatedRole,
          statusCode: 200
      });
  } catch (error) {
      next(error);
  }
};


export const assignRole = async (req: Request, res: Response, next: NextFunction) => {
  const { userId, roleId } = req.body;

  try {
      // Check if roleId exists in the database
      const role = await prisma.role.findUnique({
          where: { id: roleId },
      });

      if (!role) {
          throw RoleErrors.RoleNotFound();
      }

      // Validate permissions
      validatePermissions(role.permissions);

      // Perform a transaction to update both role and permissions atomically
      const updatedUser = await prisma.$transaction([
          prisma.users.update({
              where: { id: userId },
              data: {
                  roleId,
                  permissions: {
                      set: role.permissions,
                  },
              },
          }),
      ]);

      res.status(200).json({
          message: "Role assigned successfully",
          data: updatedUser, 
          statusCode: 200,
      });
  } catch (error) {
      next(error);
  }
};
