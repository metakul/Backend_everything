// src/Controllers/BlockchainController.ts
import { Request, Response, NextFunction } from 'express';
import BlockchainSDK from '../../Projects/Blockchain/Explorer/main.js';
import { serializeBigInt } from '../../Utils/scripts/SerializeBigInt.js';
import { BlockchainError } from '../../DataTypes/enums/Error.js';

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
       
        if (!providerUrl) {
            throw BlockchainError.MissingProviderUrl();
        }

        initializeBlockchainSDK(providerUrl, 'web3'); // You can set it to 'ethers' if needed

        const blockNumber = req.params.blockNumber === 'latest' ? 'latest' : parseInt(req.params.blockNumber);
        const block = await blockchainSDK?.getBlock(blockNumber);
        if (block) {
            // Serialize BigInt properties
            const serializedBlock = serializeBigInt(block);
            res.status(200).json(serializedBlock);
        } else {
            res.status(404).json({ error: 'Block not foundss' });
        }
    } catch (error) {
        next(error);
    }
};

export const getPreviousBlocks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log(req.body);
        
        const { providerUrl } = req.body; // Get provider URL from request body
        const { numberOfBlocks } = req.params; // Number of previous blocks to retrieve

        if (!providerUrl) {
            throw BlockchainError.MissingProviderUrl();
        }

        initializeBlockchainSDK(providerUrl, 'web3');

        const latestBlock = await blockchainSDK?.getBlock('latest');
        if (!latestBlock) {
            return res.status(404).json({ error: 'Latest block not found' });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const blocks: any[] = [];
        let currentBlockNumber = latestBlock.number;

        for (let i = 0; i < parseInt(numberOfBlocks); i++) {
            const block = await blockchainSDK?.getBlock(currentBlockNumber);
            if (block) {
                blocks.push(serializeBigInt(block));
                currentBlockNumber--; // Move to the previous block
            } else {
                break; // Stop if the block is not found
            }
        }

        res.status(200).json(blocks);
    } catch (error) {
        next(error);
    }
};

// Get all transactions in a specific block
export const getTransactionsInBlock = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { providerUrl } = req.body; // Get provider URL from request body
        const blockNumberParam = req.params.blockNumber; // Block number to retrieve transactions from

        if (!providerUrl) {
            throw BlockchainError.MissingProviderUrl();
        }

        initializeBlockchainSDK(providerUrl, 'web3');

        // Determine if the block number is 'latest' or a number
        const blockNumber = blockNumberParam === 'latest' ? 'latest' : parseInt(blockNumberParam);

        const block = await blockchainSDK?.getBlock(blockNumber);
        if (block && block.transactions) {
            const transactions = await Promise.all(
                block.transactions.map(async (txHash: string) => {
                    const transaction = await blockchainSDK?.getTransaction(txHash);
                    return serializeBigInt(transaction);
                })
            );

            res.status(200).json(transactions);
        } else {
            res.status(404).json({ error: 'Block not found or no transactions' });
        }
    } catch (error) {
        next(error);
    }
};

// Get previous blocks with a specified number of transactions
export const getAllTransactionsInPreviousBlocks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { providerUrl } = req.body; // Get provider URL from request body
        const { requiredTransactions="10" } = req.params; // Number of transactions required

        if (!providerUrl) {
            throw BlockchainError.MissingProviderUrl();
        }

        initializeBlockchainSDK(providerUrl, 'web3');

        const latestBlock = await blockchainSDK?.getBlock('latest');
        if (!latestBlock) {
            return res.status(404).json({ error: 'Latest block not found' });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transactions: any[] = []; // Array to hold the collected transactions
        let currentBlockNumber = latestBlock.number;

        // Keep fetching blocks until we reach the required number of transactions
        while (transactions.length < parseInt(requiredTransactions)) {
            const block = await blockchainSDK?.getBlock(currentBlockNumber);
            if (!block) {
                break; // Stop if the block is not found
            }

            // If the block has transactions, retrieve them
            if (block.transactions) {
                for (const txHash of block.transactions) {
                    const transaction = await blockchainSDK?.getTransaction(txHash);
                    if (transaction) {
                        transactions.push(serializeBigInt(transaction));
                        // Stop if we have reached the required number of transactions
                        if (transactions.length >= parseInt(requiredTransactions)) {
                            break;
                        }
                    }
                }
            }

            currentBlockNumber--; // Move to the previous block
        }

        res.status(200).json(transactions);
    } catch (error) {
        console.log(error);
        
        next(error);
    }
};


// Get transaction by hash
export const getTransaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { providerUrl } = req.body; // Get provider URL from request body

        console.log(req.body);
        
        if (!providerUrl) {
            throw BlockchainError.MissingProviderUrl();
        }

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

        if (!providerUrl) {
            throw BlockchainError.MissingProviderUrl();
        }
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
        
        if (!providerUrl) {
            throw BlockchainError.MissingProviderUrl();
        }
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
