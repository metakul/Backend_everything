import { createAlgodClient } from './algodClient'; // Adjust the import path as necessary

// Function to check the balance of an Algorand account
export const checkBalance = async (address: string) => {
    const algodClient = createAlgodClient(); // Create Algod client

    try {
        const acctInfo = await algodClient.accountInformation(address).do(); // Fetch account info
        console.log(`Account balance: ${acctInfo.amount} microAlgos`); // Log the balance
    } catch (error) {
        console.error('Error fetching account balance:', error);
        throw new Error('Failed to fetch account balance');
    }
};
