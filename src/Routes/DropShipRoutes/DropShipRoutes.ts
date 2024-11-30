import { Router } from "express";
import cors from "cors";
import checkJwt from "../../Middleware/checkJwt.js";
import * as DropShipController from "../../Controllers/Post/DropShipsController.js";
import { UserCategory } from "../../DataTypes/enums/IUserEnums.js";

const router: Router = Router();
router.use(cors());
//create dropShip
router.post("/",checkJwt([UserCategory.ROADIES_SUPER_ADMIN]), DropShipController.CreateDropShip);

// Route for fetching pending dropShips
router.get('/dropShipType', DropShipController.getAllDropShipsByStatus);
router.get('/dropShipCategory', DropShipController.getDropShipsByCategory);

router.get('/dropShipType', DropShipController.getAllDropShipsByStatus);

// get one dropShip
router.get("/:dropShipItemsId", DropShipController.getDropShip);

router.get("/cryptoInfo/:cryptoId", DropShipController.getCryptoInfo);

// update dropShip
router.patch("/:dropShipItemsId",checkJwt([UserCategory.ROADIES_SUPER_ADMIN]), DropShipController.updateDropShip);

router.patch('/updateStatus/:dropShipItemsId',checkJwt([UserCategory.ROADIES_SUPER_ADMIN]), DropShipController.updateDropShipStatus);

// delete dropShip
router.delete("/:dropShipItemsId",checkJwt([UserCategory.ROADIES_SUPER_ADMIN]), DropShipController.deleteDropShip);

export default router;