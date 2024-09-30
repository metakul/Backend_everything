/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from "express";
import { prisma } from "../../db/client.js";
import { getVerifiableCredentialForSDR } from "../../Projects/veramo/createSDRreq.js";
import { listIdentifiers } from "../../Projects/veramo/list-identifiers.js";
import { ErrorEnum } from "../../DataTypes/enums/Error.js";
import { accountStatus } from "../../DataTypes/enums/IUserEnums.js";

/**
 * Get org user list or count or both
 * @param status
 * @param type
 */
export const orgList = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { status, type } = req.query;

    try {
        // Validate the status
        if (status !== 'all' && !Object.values(accountStatus).includes(status as accountStatus)) {
            throw ErrorEnum.UserNotFoundwithStatus(status as accountStatus);
        }

        let users, userCount;
        const whereClause = status === 'all' ? {} : { accountStatus: status as accountStatus };

        if (type === 'list' || type === 'both') {
            users = await prisma.users.findMany({
                where: whereClause,
                select: {
                    id: true,
                    email: true,
                    name: true,
                    phoneNumber: true,
                    didCreated: true,
                    category: true,
                    accountStatus: true,
                    did: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });

            if (!users || users.length === 0) {
                throw ErrorEnum.NoUsersFound(status as accountStatus);
            }
        }

        if (type === 'count' || type === 'both') {
            userCount = await prisma.users.count({
                where: whereClause,
            });

            if (userCount === 0) {
                throw ErrorEnum.NoUsersFound(status as accountStatus);
            }
        }

        const response: any = {
            message: `${status} Org Users fetched Successfully`,
            statusCode: 200,
        };

        if (type === 'list' || type === 'both') {
            response.data = users;
        }
        if (type === 'count' || type === 'both') {
            response.count = userCount;
        }

        return res.status(200).json(response);
    } catch (error) {
        return next(error);
    }
};


// Function to get the IssueCredentialCount for a user by email
export const getIssueCredentialCount = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { _alias } = req.query

        if (!_alias) {
            throw ErrorEnum.MissingAlias()
        }
        const IssueCredentialCount = await prisma.users.findUnique({
            where: { email: _alias as string },
            select: { IssueCredentialCount: true }
        });

        res.json({
            message:`Total Credential Count Fetched for ${_alias}`,
            data:IssueCredentialCount,
            statusCode:200
        });
    } catch (error) {
        return next(error)
    }
};


/**
 * Get user credentials for SDR
 * @param 
 */
export const getCredentialsforSDR = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const claimType = req.query.claimType as string; // Ensure claimType is of type string
        const result = await getVerifiableCredentialForSDR(claimType);
        res.json({
            message:`Credential Fetched For claimType ${claimType}`,
            data:result,
            statusCode:200
            });
    } catch (error) {
        return next(error)
    }
};

/**
 * Get user all identifiers
 * @param 
 */
export const allIdentifiers = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await listIdentifiers();
        res.json({ 
            message:`Identifiers Fetched SuccessFully`,
            data:{
                number: result?.length, result: result
            },
            statusCode:200
        });
    } catch (error) {
        return next(error)
    }
};