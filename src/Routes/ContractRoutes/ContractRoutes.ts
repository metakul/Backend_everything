// src/Routes/BotRoutes/BotRoutes.ts

import express from "express";
import * as ContractsController from "../../Controllers/Post/ContractsController.js";

const router = express.Router({ mergeParams: true });

// New route for testing contracts
router.post("/testContract", ContractsController.testContract);
router.post("/deployContract", ContractsController.deployContract);
router.post("/compileContract", ContractsController.compileContract);
router.get("/getContracts", ContractsController.getContracts);
router.get("/getContractByName", ContractsController.getContractByName);

export default router;
