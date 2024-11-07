// src/Routes/BlockchainRoutes.ts
import * as BlockchainController from '../../Controllers/Post/ExplorerRoutes.js';
import express from "express";

const router = express.Router({ mergeParams: true });

// Route to get block details by number or 'latest'
router.post('/block/:blockNumber', BlockchainController.getBlock);

// Route to get transaction details by hash
router.post('/transaction/:txHash', BlockchainController.getTransaction);

// Route to send a private transaction
router.post('/transaction/private', BlockchainController.sendPrivateTransaction);

// Route to get address details (balance and transactions)
router.post('/address/:address', BlockchainController.getAddressDetails);

// get previous blocks
router.post('/blocks/previous/:numberOfBlocks', BlockchainController.getPreviousBlocks);

// get all transaction by Block no
router.post('/block/transactions/:blockNumber', BlockchainController.getTransactionsInBlock);

//get all previous trx by pagination
router.post('/block/allTransactions/:requiredTransactions', BlockchainController.getAllTransactionsInPreviousBlocks);

export default router;
