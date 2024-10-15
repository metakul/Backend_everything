// src/Controllers/BlockchainController.ts
import { Request, Response, NextFunction } from 'express';
import BlockchainSDK from '../../Projects/Blockchain/Explorer/main.js';
import { serializeBigInt } from '../../Utils/scripts/SerializeBigInt.js';

// Use a variable to hold the instance of the BlockchainSDK
let blockchainSDK: BlockchainSDK | null = null;

// Initialize the Blockchain SDK with provider URL from the request
const initializeBlockchainSDK = (providerUrl: string, providerType: 'web3' | 'ethers') => {
    blockchainSDK = new BlockchainSDK(providerUrl, providerType);
};

// Get block by number or 'latest'
export const getBlock = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { providerUrl } = req.body; // Get provider URL from request body
        initializeBlockchainSDK(providerUrl, 'web3'); // You can set it to 'ethers' if needed

        const blockNumber = req.params.blockNumber === 'latest' ? 'latest' : parseInt(req.params.blockNumber);
        const block = await blockchainSDK?.getBlock(blockNumber);
        if (block) {
            // Serialize BigInt properties
            const serializedBlock = serializeBigInt(block);
            res.status(200).json(serializedBlock);
        } else {
            res.status(404).json({ error: 'Block not found' });
        }
    } catch (error) {
        next(error);
    }
};

// Get transaction by hash
export const getTransaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { providerUrl } = req.body; // Get provider URL from request body
        initializeBlockchainSDK(providerUrl, 'web3');

        const transaction = await blockchainSDK?.getTransaction(req.params.txHash);
        const serializedTrx = serializeBigInt(transaction);
        if (transaction) {
            res.status(200).json(serializedTrx);
        } else {
            res.status(404).json({ error: 'Transaction not found' });
        }
    } catch (error) {
        next(error);
    }
};

// Send a private transaction
export const sendPrivateTransaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { providerUrl, from, to, value, gas, privateFor, privacyFlag } = req.body; // Get from request body
        initializeBlockchainSDK(providerUrl, 'web3');

        const privateOptions = { privateFor, privacyFlag };
        const receipt = await blockchainSDK?.sendPrivateTransaction(from, to, value, gas, privateOptions);
        if (receipt) {
            res.status(201).json(receipt);
        } else {
            res.status(400).json({ error: 'Failed to send private transaction' });
        }
    } catch (error) {
        next(error);
    }
};

// Get address details (balance and transactions)
export const getAddressDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { providerUrl } = req.body; // Get provider URL from request body
        initializeBlockchainSDK(providerUrl, 'web3');

        const address = req.params.address;
        const details = await blockchainSDK?.getAddressDetails(address);
        if (details) {
            // Convert BigInt properties to number
            const convertedDetails = {
                ...details,
                balance: details.balance ? serializeBigInt(details.balance) : 0,
            };

            res.status(200).json(convertedDetails);
        } else {
            res.status(404).json({ error: 'Address not found or no transactions' });
        }
    } catch (error) {
        next(error);
    }
};
