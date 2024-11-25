// src/Routes/BotRoutes/BotRoutes.ts

import express from "express";
import * as ContractsController from "../../Controllers/Post/ContractsController.js";

const router = express.Router({ mergeParams: true });

// New route for testing contracts
/**
 * @swagger
 * /testContract:
 *   post:
 *     summary: Test contract functionality
 *     tags: 
 *       - Contracts
 *     responses:
 *       200:
 *         description: Contract test executed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Contract test executed successfully."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */

router.post("/testContract", ContractsController.testContract);
/**
 * @swagger
 * /deployContract:
 *   post:
 *     summary: Deploy a contract
 *     tags: 
 *       - Contracts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contractName:
 *                 type: string
 *                 example: "MySmartContract"
 *     responses:
 *       200:
 *         description: Contract deployed successfully
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Internal server error
 */


router.post("/deployContract", ContractsController.deployContract);
/**
 * @swagger
 * /compileContract:
 *   post:
 *     summary: Compile a contract
 *     tags: 
 *       - Contracts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contractName:
 *                 type: string
 *                 example: "MySmartContract"
 *     responses:
 *       200:
 *         description: Contract compiled successfully
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Internal server error
 */

router.post("/compileContract", ContractsController.compileContract);

/**
 * @swagger
 * /getContracts:
 *   get:
 *     summary: Retrieve all contracts
 *     tags: 
 *       - Contracts
 *     responses:
 *       200:
 *         description: List of contracts retrieved successfully
 *       500:
 *         description: Internal server error
 */

router.get("/getContracts", ContractsController.getContracts);

/**
 * @swagger
 * /getContractByName:
 *   get:
 *     summary: Retrieve a contract by name
 *     tags: 
 *       - Contracts
 *     parameters:
 *       - in: query
 *         name: contractName
 *         required: true
 *         schema:
 *           type: string
 *           example: "MySmartContract"
 *     responses:
 *       200:
 *         description: Contract details retrieved successfully
 *       400:
 *         description: Invalid query parameter
 *       500:
 *         description: Internal server error
 */
router.get("/getContractByName", ContractsController.getContractByName);


// user contract routes
/**
 * @swagger
 * /saveDeployedContract:
 *   post:
 *     summary: Save a deployed contract
 *     tags: 
 *       - Contracts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contractName:
 *                 type: string
 *                 example: "MySmartContract"
 *               deployedAddress:
 *                 type: string
 *                 example: "0x1234567890abcdef1234567890abcdef12345678"
 *               walletAddress:
 *                 type: string
 *                 example: "0xabcdef1234567890abcdef1234567890abcdef12"
 *     responses:
 *       200:
 *         description: Deployed contract saved successfully
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Internal server error
 */

router.post("/saveDeployedContract", ContractsController.saveDeployedContract);

/**
 * @swagger
 * /getMyContracts:
 *   get:
 *     summary: Retrieve contracts associated with a wallet address
 *     tags: 
 *       - Contracts
 *     parameters:
 *       - in: query
 *         name: walletAddress
 *         required: true
 *         schema:
 *           type: string
 *           example: "0xabcdef1234567890abcdef1234567890abcdef12"
 *     responses:
 *       200:
 *         description: List of contracts retrieved successfully
 *       400:
 *         description: Invalid query parameter
 *       500:
 *         description: Internal server error
 */
router.get("/getMyContracts", ContractsController.getContractsByWalletAddress);
export default router;
