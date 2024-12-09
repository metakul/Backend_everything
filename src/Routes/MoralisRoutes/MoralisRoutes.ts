import express from "express";
import * as MoralisController from "../../Controllers/Moralis/MoralisGetController.js";

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * /tokenPrice:
 *   get:
 *     summary: Get token prices and their ratio
 *     tags:
 *       - Token
 *     parameters:
 *       - in: query
 *         name: addressOne
 *         required: true
 *         schema:
 *           type: string
 *           example: "0x1234567890abcdef1234567890abcdef12345678"
 *       - in: query
 *         name: addressTwo
 *         required: true
 *         schema:
 *           type: string
 *           example: "0xabcdef1234567890abcdef1234567890abcdef12"
 *     responses:
 *       200:
 *         description: Token prices retrieved successfully
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Internal server error
 */
router.get("/tokenPrice", MoralisController.tokenPrice);

/**
 * @swagger
 * /tokenPriceSingle:
 *   get:
 *     summary: Get single token price
 *     tags:
 *       - Token
 *     parameters:
 *       - in: query
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *           example: "0x1234567890abcdef1234567890abcdef12345678"
 *     responses:
 *       200:
 *         description: Token price retrieved successfully
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Internal server error
 */
router.get("/tokenPriceSingle", MoralisController.tokenPriceSingle);
/**
 * @swagger
 * /tokenPriceMultiple:
 *   get:
 *     summary: Get multiple token prices
 *     tags:
 *       - Token
 *     parameters:
 *       - in: query
 *         name: addresses
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *           example: ["0x1234567890abcdef1234567890abcdef12345678", "0xabcdef1234567890abcdef1234567890abcdef12"]
 *     responses:
 *       200:
 *         description: Token prices retrieved successfully
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Internal server error
 */
router.get("/tokenPriceMultiple", MoralisController.tokenPriceMultiple);

export default router;