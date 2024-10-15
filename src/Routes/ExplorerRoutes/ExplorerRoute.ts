// src/Routes/BlockchainRoutes.ts
import { Router } from 'express';
import * as BlockchainController from '../../Controllers/Post/ExplorerRoutes.js';

const router: Router = Router();

// Route to get block details by number or 'latest'
router.get('/block/:blockNumber', BlockchainController.getBlock);

// Route to get transaction details by hash
router.get('/transaction/:txHash', BlockchainController.getTransaction);

// Route to send a private transaction
router.post('/transaction/private', BlockchainController.sendPrivateTransaction);

// Route to get address details (balance and transactions)
router.get('/address/:address', BlockchainController.getAddressDetails);

export default router;
