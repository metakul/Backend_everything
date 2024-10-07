import algosdk from 'algosdk';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Function to create an Algorand client
export const createAlgodClient = () => {
    const token = process.env.ALGOD_TOKEN || 'a'.repeat(64); // Default to 64 'a's if not set
    const server = process.env.ALGOD_SERVER || 'http://localhost';
    const port = Number(process.env.ALGOD_PORT) || 4001;

    const algodClient = new algosdk.Algodv2(token, server, port);
    return algodClient;
};
