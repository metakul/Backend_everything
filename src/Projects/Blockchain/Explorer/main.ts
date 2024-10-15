/* eslint-disable @typescript-eslint/no-explicit-any */
import Web3, { TransactionReceipt } from 'web3';
import { ethers, Transaction } from 'ethers';

type ProviderType = 'web3' | 'ethers';
type BlockchainPrivacyOptions = {
    privateFor?: string[];
    privacyFlag?: number;
};

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
    private provider: Web3 | ethers.JsonRpcProvider;
    private type: ProviderType;

    constructor(providerUrl: string, providerType: ProviderType = 'web3') {
        this.type = providerType;

        if (this.type === 'web3') {
            this.provider = new Web3(providerUrl);
        } else {
            this.provider = new ethers.JsonRpcProvider(providerUrl);
        }
    }

    // Fetch block by number or 'latest'
    async getBlock(blockNumber: number | 'latest'): Promise<any | null> {
        try {
            if (this.type === 'web3') {
                const block = await (this.provider as Web3).eth.getBlock(blockNumber);
                return block;
            } else {
                const block = await (this.provider as ethers.JsonRpcProvider).getBlock(blockNumber as number);
                return block;
            }
        } catch (error) {
            console.error(`Error fetching block: ${error}`);
            return null;
        }
    }

    // Fetch transaction by hash
    async getTransaction(txHash: string): Promise<any | null> {
        try {
            if (this.type === 'web3') {
                const transaction = await (this.provider as Web3).eth.getTransaction(txHash);
                return transaction;
            } else {
                const transaction = await (this.provider as ethers.JsonRpcProvider).getTransaction(txHash);
                return transaction;
            }
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
        privateOptions: BlockchainPrivacyOptions
    ): Promise<TransactionReceipt | null | any> {
        try {
            if (this.type === 'web3') {
                const tx = {
                    from,
                    to,
                    value,
                    gas,
                    ...privateOptions,
                };

                // Send the transaction and get the transaction hash
                const txHash = await (this.provider as Web3).eth.sendTransaction(tx)
                    .catch(err => {
                        console.error('Error during transaction:', err);
                        throw err; 
                    });

                // Check if txHash exists and return it; otherwise, throw an error
                if (txHash) {
                    return txHash;
                } else {
                    throw new Error('Transaction hash is undefined or null');
                }
            } else {
                throw new Error('Private transactions are supported only with Web3 in this SDK');
            }
        } catch (error) {
            console.error(`Error sending private transaction: ${error}`);
            throw new Error(`Failed to send private transaction: ${error}`);
        }
    }


    // Fetch balance and transactions of an address
    async getAddressDetails(address: string): Promise<any | null> {
        try {
            let balance: bigint = BigInt(0);
            let transactions: Transaction[] = [];

            if (this.type === 'web3') {
                balance = await (this.provider as Web3).eth.getBalance(address);
                transactions = await this.getTransactionsByAddress(address);
            } else {
                balance = await (this.provider as ethers.JsonRpcProvider).getBalance(address);
                transactions = await this.getTransactionsByAddress(address);
            }

            return { balance, transactions };
        } catch (error) {
            console.error(`Error fetching address details: ${error}`);
            return null;
        }
    }

    // Helper to get address transactions
    
    private async getTransactionsByAddress(address: string): Promise<Transaction[]> {
        const transactions: Transaction[] = [];
        const latestBlock = await this.getBlock('latest');

        if (latestBlock && latestBlock.transactions) {
            // Iterate over each transaction in the latest block
            for (const txHash of latestBlock.transactions) {
                const tx = await this.getTransaction(txHash as string);
                // Check if the transaction involves the specified address
                if (tx && (tx.from === address || tx.to === address)) {
                    transactions.push(tx);
                }
            }
        }

        return transactions;
    }

}

export default BlockchainSDK;
