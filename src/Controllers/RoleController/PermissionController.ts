import { NextFunction, Response, Request } from "express";
import { CreatePermissionControl, DeletePermissionControl, getPermissionsData, ReadPermissionControl, UpdatePermissionControl } from "../../DataTypes/rbac/permission.js";
import { Permissions } from "../../DataTypes/interfaces/IUser";




export const getPermissions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const permissions = getPermissionsData();
        res.status(200).json({
            message: "Permissions retrieved successfully",
            data: permissions,
            statusCode: 200
        });
    } catch (error) {
        next(error); 
    }
};
