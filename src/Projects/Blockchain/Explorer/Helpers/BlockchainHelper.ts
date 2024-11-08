// BlockchainHelper.ts

import { ethers } from 'ethers';

export async function calculateTotalTransactions(provider: ethers.JsonRpcProvider, fromBlock: number, toBlock: number): Promise<number> {
    let totalTransactions = 0;

    for (let i = fromBlock; i <= toBlock; i++) {
        const block = await provider.getBlock(i);
        if (block && block.transactions) {
            totalTransactions += block.transactions.length;
        }
    }

    return totalTransactions;
}

export async function calculateAverageBlockTime(provider: ethers.JsonRpcProvider, startBlock: number, endBlock: number): Promise<number> {
    const startBlockDetails = await provider.getBlock(startBlock);
    const endBlockDetails = await provider.getBlock(endBlock);

    if (!startBlockDetails || !endBlockDetails) {
        throw new Error('Failed to fetch block details');
    }

    const blockTimeDifference = endBlockDetails.timestamp - startBlockDetails.timestamp;
    const blockCount = endBlock - startBlock;

    return blockTimeDifference / blockCount;
}

export async function getGasUsedToday(provider: ethers.JsonRpcProvider): Promise<bigint> {

    const blocksToday = await provider.getBlockNumber();
    let gasUsedToday = BigInt(0);

    // Fetch the blocks from the last 24 hours
    for (let i = blocksToday; i >= blocksToday - 576; i--) {  // ~576 blocks per 24 hours (assuming block time of 13s)
        const block = await provider.getBlock(i);
        if (block) {
            gasUsedToday += BigInt(block.gasUsed);
        }
    }

    return gasUsedToday;
}

export async function getTransactionsToday(provider: ethers.JsonRpcProvider): Promise<number> {
    const latestBlock = await provider.getBlock('latest');
    const blocksToday = Math.floor(24 * 60 * 60 / 13); // average block time: 13 seconds

    let transactionsToday = 0;

    // Check the number of transactions in the blocks for today
    if (latestBlock) {
        for (let i = latestBlock.number; i >= latestBlock.number - blocksToday; i--) {
            const block = await provider.getBlock(i);
            if (block) {
                transactionsToday += block.transactions.length;
            }
        }
    } else {
        throw new Error('Failed to fetch the latest block');
    }

    return transactionsToday;
}
