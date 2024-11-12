/* eslint-disable @typescript-eslint/no-explicit-any */
import { ethers, Transaction } from 'ethers';
import { NetworkStats } from '../DataTypes/interfaces';
// import { calculateAverageBlockTime, calculateTotalTransactions, getGasUsedToday, getTransactionsToday } from './Helpers/BlockchainHelper.js';

type ProviderType = 'ethers';


// interface Block {
//     number: number;
//     timestamp: number;
//     transactions: string[];
//     [key: string]: any;
// }

// interface Transaction {
//     hash: string;
//     from: string;
//     to: string;
//     value: string;
//     gas: number;
//     [key: string]: any;
// }

// interface AddressDetails {
//     balance: string;
//     transactions: Transaction[];
// }

class BlockchainSDK {
    private provider: ethers.JsonRpcProvider;
    private type: ProviderType;

    constructor(providerUrl: string, providerType: ProviderType = 'ethers') {
        this.type = providerType;

        this.provider = new ethers.JsonRpcProvider(providerUrl);
    }

    // Fetch block by number or 'latest'
    async getBlock(blockNumber: number | 'latest'): Promise<any | null> {
        try {

            const block = await (this.provider as ethers.JsonRpcProvider).getBlock(blockNumber as number);
            return block;
        } catch (error) {
            console.error(`Error fetching block: ${error}`);
            return null;
        }
    }

    // Fetch transaction by hash
    async getTransaction(txHash: string): Promise<any | null> {
        try {

            const transaction = await (this.provider as ethers.JsonRpcProvider).getTransaction(txHash);
            return transaction;
        } catch (error) {
            console.error(`Error fetching transaction: ${error}`);
            return null;
        }
    }

    // Send a Blockchain private transaction
    async sendPrivateTransaction(
        from: string,
        to: string,
        value: string,
        gas: number,
        // privateOptions: BlockchainPrivacyOptions
    ): Promise<any | null | any> {
        try {
            console.log(from, to, value, gas);

            throw new Error('Private transactions are not implemented with this SDK');
        } catch (error) {
            throw new Error(`Failed to send private transaction: ${error}`);
        }
    }


    // Fetch balance and transactions of an address
    async getAddressDetails(address: string): Promise<any | null> {
        try {
            let balance: bigint = BigInt(0);
            let transactions: Transaction[] = [];

            balance = await (this.provider as ethers.JsonRpcProvider).getBalance(address);
            transactions = await this.getTransactionsByAddress(address);

            return { balance, transactions };
        } catch (error) {
            console.error(`Error fetching address details: ${error}`);
            return null;
        }
    }

    // Helper to get address transactions

    private async getTransactionsByAddress(address: string, blockCount: number = 5): Promise<Transaction[]> {
        const transactions: Transaction[] = [];

        // Start from the latest block
        const currentBlockNumber: number = await (this.provider as ethers.JsonRpcProvider).getBlockNumber();


        for (let i = 0; i < blockCount; i++) {
            const block = await this.getBlock(currentBlockNumber - i);
            if (block && block.transactions) {
                // Iterate over each transaction in the block
                for (const txHash of block.transactions) {
                    const tx = await this.getTransaction(txHash as string);
                    // Check if the transaction involves the specified address
                    if (tx && (tx.from === address || tx.to === address)) {
                        transactions.push(tx);
                    }
                }
            }
        }

        return transactions;
    }
    async getNetworkStats(): Promise<NetworkStats | null> {
        try {
            // const blockNumber = await this.provider.getBlockNumber();
            const feeData = await this.provider.getFeeData();
            const gasPrice = feeData.gasPrice;
            const staticGasPrice = gasPrice ? ethers.formatUnits(gasPrice, 'gwei') : '0';

            // Calculate dynamic stats using helper functions
            // const totalTransactions = await calculateTotalTransactions(this.provider, blockNumber - 10000, blockNumber); // Last 10000 blocks
            const totalTransactions = 100
            // const averageBlockTime = await calculateAverageBlockTime(this.provider, blockNumber - 100, blockNumber); // Last 100 blocks
            const averageBlockTime = 100
            // const gasUsedToday = await getGasUsedToday(this.provider);
            const gasUsedToday = 1000;
            // const transactionsToday = await getTransactionsToday(this.provider);
            const transactionsToday = 100
            // const blocksToday = Math.floor(24 * 60 * 60 / averageBlockTime); // Estimated blocks for 24 hours
            const blocksToday = 100 // Estimated blocks for 24 hours

            const networkUtilizationPercentage = parseFloat((parseInt(gasUsedToday.toString()) / totalTransactions * 100).toFixed(2));

            const gasPrices = {
                average: parseFloat(staticGasPrice),
                fast: parseFloat(staticGasPrice) * 1.2,
                slow: parseFloat(staticGasPrice) * 0.8,
            };

            return {
                totalBlocks: blocksToday,
                totalAddresses: 1000000,
                totalTransactions,
                averageBlockTime,
                totalGasUsed: gasUsedToday.toString(),
                transactionsToday,
                gasUsedToday: gasUsedToday.toString(),
                gasPrices,
                staticGasPrice,
                networkUtilizationPercentage,
            };
        } catch (error) {
            console.error(`Error fetching network stats: ${error}`);
            return null;
        }
    }


}

export default BlockchainSDK;
