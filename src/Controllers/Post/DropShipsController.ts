import { Request, Response, NextFunction } from "express";
import { IUpadateDropShip, IdropShip } from "../../DataTypes/interfaces/IDropShip.js";
import { fetchCryptoData } from "../../Utils/scripts/AxiosCall.js";
import { prisma } from "../../db/client.js";
import { DropShipsStatusInfo } from "../../DataTypes/enums/IUserEnums.js";
import { DropShipIdValidationService, DropShipValidationService, CryptoIdValidationService } from "../../Validation/DropShipValidation.js";
import { RequestWithUser } from "../../Middleware/checkJwt.js";
import { DropShipsError } from "../../DataTypes/enums/Error.js";

/**
 * add new DropShip
 * @param dropShipModelValidation
 */
const addDropShip = async (dropShipModelValidation: IdropShip) => {
  try {
    const dropShip = await prisma.dropShips.create({
        data: {
          title: dropShipModelValidation.title,
          description: dropShipModelValidation.description || '',
          image: dropShipModelValidation.image,
          author: dropShipModelValidation.author,
          categories: dropShipModelValidation.categories,
          price: dropShipModelValidation.price,
          totalItemRemaining: dropShipModelValidation.totalItemRemaining,
          status: DropShipsStatusInfo.PENDING
        },
      });
    return dropShip;

  } catch (error) {
    console.log(error);
    throw DropShipsError.ErrorAddingDropShip();
  }
};

/**
 * Create a new dropShip
 * @param req
 * @param res
 * @param next
 */
export const CreateDropShip = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const dropShipModelValidation: IdropShip | undefined = await DropShipValidationService.validateCreateDropShip(
        req.body
      );

    if (!dropShipModelValidation) {
      throw DropShipsError.InvalidDropShipDetails(dropShipModelValidation);
    } else {
      const newDropShip = await addDropShip(dropShipModelValidation);
      res.status(201).json(
        newDropShip);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get all dropShips based on status, sorted by the latest update
 * @param req
 * @param res
 * @param next
 */
export const getAllDropShipsByStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status } = req.query;

    // Validate the status query parameter
    if (!status || (status !== DropShipsStatusInfo.APPROVED && status !== DropShipsStatusInfo.PENDING)) {
      throw DropShipsError.InvalidStatusProvided();
    }

    // Pagination parameters
    const pageSize = parseInt(req.query.pagesize as string, 10) || 10;
    const page = parseInt(req.query.page as string, 10) || 1;
    const skip = (page - 1) * pageSize;

    // Query the dropShips, sorted by 'updatedAt' in descending order
    const dropShips = await prisma.dropShips.findMany({
      where: {
        status: status || DropShipsStatusInfo.APPROVED, // Default to APPROVED if status is not provided
      },
      skip: skip,
      take: pageSize,
      orderBy: {
        updatedAt: 'desc', // Sort by latest updates first
      },
    });

    if (dropShips.length > 0) {
      res.status(200).json(dropShips);
    } else {
      throw DropShipsError.DropShipNotFound();
    }
  } catch (error) {
    next(error);
  }
};


/**
 * get one dropShip
 * @param req
 * @param res
 * @param next
 */
export const getDropShip = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const dropShipItemsIdValidation = await DropShipIdValidationService.validateDropShipId(
      req.params.dropShipItemsId
    );
    
    if (!dropShipItemsIdValidation) {
      throw DropShipsError.InvalidDropShipDetails(dropShipItemsIdValidation);
    } else {
      const getDropShips = await prisma.dropShips.findMany({
        where: {
          id: req.params.dropShipItemsId,
        },
      });

      if (getDropShips.length > 0) {
        res.status(200).json(getDropShips);
      } else {
        throw DropShipsError.DropShipNotFound();
      }
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Update status of a dropShip
 * @param req
 * @param res
 * @param next
 */
export const updateDropShipStatus = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const { dropShipItemsId } = req.params;
    const { status } = req.body;

    if (!dropShipItemsId || !status) {
      throw DropShipsError.InvalidDropShipDetails(dropShipItemsId);
    }
  
    if (!Object.values(DropShipsStatusInfo).includes(status)) {
      throw DropShipsError.InvalidStatusProvided();
    }

    const updatedDropShip = await prisma.dropShips.updateMany({
        where: {
          id:dropShipItemsId,
        },
        data: {
          status,
        },
      });

      if (updatedDropShip.count > 0) {
        // Retrieve the updated dropShip data
        const updatedDropShipData = await prisma.dropShips.findUnique({
          where: {
            id: dropShipItemsId,
          },
        });
        res.status(200).json(updatedDropShipData);
    } else {
      throw DropShipsError.DropShipNotFound();
    }
  } catch (error) {
    next(error);
  }
};

/**
 * delete dropShip
 * @param req
 * @param res
 * @param next
 */
export const deleteDropShip = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const dropShipItemsIdValidation = await DropShipIdValidationService.validateDropShipId(
      req.params.dropShipItemsId
    );

    if (!dropShipItemsIdValidation) {
      throw DropShipsError.InvalidDropShipDetails(dropShipItemsIdValidation);
    } else {
      const deleteDropShips = await prisma.dropShips.delete({
          where: { id: dropShipItemsIdValidation },
        });
        
      if (deleteDropShips) {
        res.status(200).json(deleteDropShips);
      } else {
        throw DropShipsError.DropShipNotFound();
      }
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Update dropShip
 * @param req
 * @param res
 * @param next
 */
export const updateDropShip = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const resUpdateDropShipValidation: IUpadateDropShip = await DropShipValidationService.validateUpdateDropShip(
      req.body
    );

    console.log(resUpdateDropShipValidation);

    // Ensure `id` is not being updated by accident
    const { dropShipItemsId, ...updateData } = resUpdateDropShipValidation;

    const updatedDropShip = await prisma.dropShips.update({
      where: { id: dropShipItemsId },
      data: {
        title: updateData.title,
        description: updateData.description,
        image: updateData.image,
        author: updateData.author,
        categories: updateData.categories,
        price: updateData.price,
        totalItemRemaining: updateData.totalItemRemaining,
      },
    });

    if (updatedDropShip) {
      res.status(200).json(updatedDropShip);
    } else {
      throw DropShipsError.DropShipNotFound();
    }
  } catch (error) {
    next(error);
  }
};



//todo change this cryptoInfo to getPrice of items
/**
 * get one Crypto
 * @param req
 * @param res
 * @param next
 */
export const getCryptoInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const dropShipItemsIdValidation = await CryptoIdValidationService.validateCryptoId(
      req.params.cryptoId
    );

    if (!dropShipItemsIdValidation) {
      throw DropShipsError.InvalidDropShipDetails(dropShipItemsIdValidation);
    } else
    {

      const cryptoData = await fetchCryptoData(dropShipItemsIdValidation);
      
      res.status(200).json(cryptoData);
    }

  } catch (error) {
    next(error);
  }
};
