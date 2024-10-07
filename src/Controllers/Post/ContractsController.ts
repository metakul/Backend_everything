/* eslint-disable @typescript-eslint/no-explicit-any */
// src/Controllers/Post/BotController.ts

import { exec } from 'child_process';
import { promisify } from 'util';
import { NextFunction, Request, Response } from 'express';
// import { HardhatUserConfig } from "hardhat/config";
// import getConfig from "../../Projects/Blockchain/hardhat/hardhat.config.js";
import path from 'path';
import { fileURLToPath } from 'url';
import { BlockchainError } from '../../DataTypes/enums/Error.js';
import winston from "winston";
import { logWithMessageAndStep } from "../../Helpers/Logger/logger.js"; // Import your logging function
import fs from "fs"

// For ES modules: define __dirname manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const execPromise = promisify(exec);

export const testContract = async (req: Request, res: Response, next: NextFunction) => {
    const childLogger = (req as any).childLogger as winston.Logger;

    if (!childLogger) {
        return next(new Error('Internal Server Error'));
    }



    try {

        logWithMessageAndStep(childLogger, "Step 1", "Executing contract tests", "testContract", JSON.stringify(req.body), "info");

        const command = `npx hardhat test`;

        try {
            // Run the appropriate Hardhat command
            const { stdout, stderr } = await execPromise(command, {
                cwd: path.join(__dirname, "../../Projects/Blockchain/hardhat"),
            });

            // Check for stderr or specific conditions to throw an error
            if (stderr && stderr.trim() !== "") {
                logWithMessageAndStep(childLogger, "Error Step", "Error running tests", "testContract", stderr, "error");
                throw BlockchainError.HardhatError(stderr);
            }

            // Additional condition to check if stdout is empty
            if (stdout.trim() === "") {
                logWithMessageAndStep(childLogger, "Warning Step", "Command executed successfully but produced no output", "testContract", "No output", "warn");
                throw BlockchainError.HardhatError("empty response from hardhat");
            }

            return res.status(200).json({ success: true, output: stdout });
        } catch (error) {
            // Log and handle the error
            logWithMessageAndStep(childLogger, "Error Step", "Error running tests", "testContract", JSON.stringify(error), "error");
            throw BlockchainError.HardhatError(error);
        }


        
    } catch (error) {
        console.log(error);
        
        return next(error);
    }
};


export const deployContract = async (req: Request, res: Response, next: NextFunction) => {

    const childLogger = (req as any).childLogger as winston.Logger;

    if (!childLogger) {
        return next(new Error('Internal Server Error'));
    }

    const { contractName } = req.body;

    // Validate input for contractName, rpcEndpoint, and privateKey
    if (!contractName ) {
        return next(BlockchainError.MissingContractNameOrPrivateKey()); 
    }

    try {

        logWithMessageAndStep(childLogger, "Step 1", "Deploying contract", "deployContract", JSON.stringify(req.body), "info");

        const command = ` npx hardhat ignition deploy ./ignition/modules/${contractName}.ts`;
        try {
            // Run the appropriate Hardhat command
            const { stdout, stderr } = await execPromise(command, {
                cwd: path.join(__dirname, "../../Projects/Blockchain/hardhat"),
            });

            // Check for stderr or specific conditions to throw an error
            if (stderr && stderr.trim() !== "") {
                logWithMessageAndStep(childLogger, "Error Step", "Error running deployer", "deployContract", stderr, "error");
                throw BlockchainError.HardhatError(stderr);
            }

            // Additional condition to check if stdout is empty
            if (stdout.trim() === "") {
                logWithMessageAndStep(childLogger, "Error Step", "Error deploying contract", "deployContract", stderr, "error");
                throw BlockchainError.HardhatError("empty response from hardhat");

            }

            return res.status(200).json({ success: true, output: stdout });
        } catch (error) {
            // Log and handle the error
            logWithMessageAndStep(childLogger, "Error Step", "Error running tests", "deployContract", JSON.stringify(error), "error");
            throw BlockchainError.HardhatError(error);
        }
    } catch (error) {
        logWithMessageAndStep(childLogger, "Error Step", "Error deploying contract", "deployContract", JSON.stringify(error), "error");
        next(error)
    }
};
export const compileContract = async (req: Request, res: Response, next: NextFunction) => {

    const childLogger = (req as any).childLogger as winston.Logger;

    if (!childLogger) {
        return next(new Error('Internal Server Error'));
    }

    const { contractName } = req.body;

    // Validate input for contractName
    if (!contractName ) {
        return next(BlockchainError.MissingContractNameOrPrivateKey()); // Using your BlockchainError structure
    }

    try {

        logWithMessageAndStep(childLogger, "Step 1", "Compiling contract", "compileContract", JSON.stringify(req.body), "info");

        const command = ` npx hardhat compile `;
        try {
            // Run the appropriate Hardhat command
            const { stdout, stderr } = await execPromise(command, {
                cwd: path.join(__dirname, "../../Projects/Blockchain/hardhat"),
            });

            // Check for stderr or specific conditions to throw an error
            if (stderr && stderr.trim() !== "") {
                logWithMessageAndStep(childLogger, "Error Step", "Error  compiling", "compileContract", stderr, "error");
                throw BlockchainError.HardhatError(stderr);
            }

            // Additional condition to check if stdout is empty
            if (stdout.trim() === "") {
                logWithMessageAndStep(childLogger, "Error Step", "Error compiling contract", "compileContract", stderr, "error");
                throw BlockchainError.HardhatError("empty response from hardhat");

            }

            return res.status(200).json({ success: true, output: stdout });
        } catch (error) {
            // Log and handle the error
            logWithMessageAndStep(childLogger, "Error Step", "Error  compiling", "compileContract", JSON.stringify(error), "error");
            throw BlockchainError.HardhatError(error);
        }
    } catch (error) {
        logWithMessageAndStep(childLogger, "Error Step", "Error compiling contract", "compileContract", JSON.stringify(error), "error");
        next(error)
    }
};
// Recursively gather contract details from the artifacts directory
const getContractsAndConstructors = (directory: string) => {
    const contracts: { contractName: any; constructor: any; }[] = [];

    const readDirectoryRecursively = (dir: string) => {
        const files = fs.readdirSync(dir);

        files.forEach(file => {
            const filePath = path.join(dir, file);

            // If the current file is a directory, recurse into it
            if (fs.statSync(filePath).isDirectory()) {
                readDirectoryRecursively(filePath);
            } else if (file.endsWith('.json')) {
                // Read the JSON artifact file for the contract
                const contractArtifact = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

                // Ensure this is a contract artifact with a valid ABI
                if (contractArtifact.abi) {
                    const contractName = contractArtifact.contractName || file.replace('.json', '');
                    const abi = contractArtifact.abi;

                    // Find constructor details if available
                    const constructorAbi = abi.find((item: any) => item.type === 'constructor');
                    const constructor = constructorAbi ? constructorAbi.inputs : [];

                    // Add contract details to the list
                    contracts.push({
                        contractName,
                        constructor
                    });
                }
            }
        });
    };

    readDirectoryRecursively(directory);

    return contracts;
};

export const getContracts = async (req: Request, res: Response, next: NextFunction) => {
    const childLogger = (req as any).childLogger as winston.Logger;

    if (!childLogger) {
        return next(new Error('Internal Server Error'));
    }

    try {
        logWithMessageAndStep(childLogger, "Step 1", "Compiling contracts", "compileContract", JSON.stringify(req.body), "info");


        // Read the compiled contract artifacts and extract contract names and constructors
        const artifactsDir = path.join(__dirname, "../../Projects/Blockchain/hardhat/artifacts/contracts");
        const contracts = getContractsAndConstructors(artifactsDir);

        logWithMessageAndStep(childLogger, "Step 2", "Compiled contracts successfully", "compileContract", "Contracts listed", "info");

        return res.status(200).json({ success: true, contracts})
    } catch (error) {
        logWithMessageAndStep(childLogger, "Error Step", "Error compiling contracts", "compileContract", JSON.stringify(error), "error");
        next(error);
    }
};

// Recursively gather contract details from the artifacts directory
const getContractAbi = (directory: string, contractName: string | null = null) => {
    const contracts: { contractName: string; abi: any; bytecode: string; constructor: any; }[] = [];

    const readDirectoryRecursively = (dir: string) => {
        const files = fs.readdirSync(dir);

        files.forEach(file => {
            const filePath = path.join(dir, file);

            // If the current file is a directory, recurse into it
            if (fs.statSync(filePath).isDirectory()) {
                readDirectoryRecursively(filePath);
            } else if (file.endsWith('.json')) {
                // Read the JSON artifact file for the contract
                const contractArtifact = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

                // Ensure this is a contract artifact with a valid ABI
                if (contractArtifact.abi && contractArtifact.bytecode) {
                    const artifactContractName = contractArtifact.contractName || file.replace('.json', '');

                    // If contractName is provided, filter based on it
                    if (contractName && artifactContractName !== contractName) {
                        return;
                    }

                    const abi = contractArtifact.abi;
                    const bytecode = contractArtifact.bytecode;

                    // Find constructor details if available
                    const constructorAbi = abi.find((item: any) => item.type === 'constructor');
                    const constructor = constructorAbi ? constructorAbi.inputs : [];

                    // Add contract details to the list
                    contracts.push({
                        contractName: artifactContractName,
                        abi,
                        bytecode,
                        constructor
                    });
                }
            }
        });
    };

    readDirectoryRecursively(directory);

    return contracts;
};

// Controller to get contract details by contract name
export const getContractByName = async (req: Request, res: Response, next: NextFunction) => {
    const childLogger = (req as any).childLogger as winston.Logger;
    const { contractName } = req.query;  // Assuming the contract name is passed as a query parameter

    if (!childLogger) {
        return next(new Error('Internal Server Error'));
    }

    if (!contractName) {
        return res.status(400).json({ success: false, message: 'Contract name is required' });
    }

    try {
        logWithMessageAndStep(childLogger, "Step 1", "Fetching contract details", "getContractByName", JSON.stringify(req.body), "info");

        // Read the compiled contract artifacts and extract contract details by name
        const artifactsDir = path.join(__dirname, "../../Projects/Blockchain/hardhat/artifacts/contracts");
        const contracts = getContractAbi(artifactsDir, contractName as string);

        if (contracts.length === 0) {
            return res.status(404).json({ success: false, message: `Contract with name "${contractName}" not found` });
        }

        logWithMessageAndStep(childLogger, "Step 2", "Fetched contract details successfully", "getContractByName", "Contract found", "info");

        return res.status(200).json({ success: true, contract: contracts[0] });
    } catch (error) {
        logWithMessageAndStep(childLogger, "Error Step", "Error fetching contract details", "getContractByName", JSON.stringify(error), "error");
        next(error);
    }
};