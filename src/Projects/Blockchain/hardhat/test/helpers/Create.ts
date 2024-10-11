import { ethers } from "hardhat";
import { AddressLike, BytesLike, keccak256, toUtf8Bytes, Wallet, ZeroAddress, zeroPadBytes } from "ethers";
import { SaleDeedType } from "../DataTypes/DataTypes";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
const randomLocation = ["Kanpur", "Delhi", "Mumbai", "Bangalore", "Chennai"][Math.floor(Math.random() * 5)]; // Random location

interface Owner {
    executantPublicKey: AddressLike;
    aadhaarHash: string;
    uniquePropertyCardIds: string;
    isApprovedForPOA: boolean;
    POAAddress: string;

  }
export function createRandomProperty(managerAddress: any, ownerNeeded: boolean = true) {

    const propertyId = keccak256(toUtf8Bytes(`unique_property_id_${Math.random()}`)); // Randomized property ID

    // Convert managerAddress (an Ethereum address) to bytes32

    return {
        location: randomLocation, // Ensure this matches the expected Solidity type
        uniquePropertyId: propertyId as BytesLike, // bytes32
        claimantsPublicKey: [managerAddress], // Converted to bytes32
        encumbranceIds: [], // Empty array of whatever type encumbranceIds expect
        propertyownerInfo: ownerNeeded ? addRandomOwners(managerAddress) : [], // Array of owner
    };
}
export async function createPropertyWithUserConsent(
    executantWallets: HardhatEthersSigner[],
    executantNonce: any,
    consentNeeded: boolean = true
) {
    // Generate random property ID
    const propertyId = keccak256(toUtf8Bytes(`unique_property_id_${Math.random()}`));

    const claimantAddress = executantWallets.map((wallet) => wallet.address);

    // Create random owners asynchronously
    const ownerPromises = executantWallets.map((wallet) => createRandomOwner(wallet.address));
    const randomOwners = await Promise.all(ownerPromises); // Await the promises here

    // Generate PropertyRegistrationConsent for each owner
    const ownerConsent = await Promise.all(
        randomOwners.map(async (owner, index) => {
            // Create executantSignedDataHash (hash of propertyId and nonce) // executrant signature should be signed for property function based on storage
            const executantSignedDataHash = keccak256(
                toUtf8Bytes(`${propertyId}_${executantNonce}`)
            );

            // Generate executantSignature by signing the hash
            const executantSignature = await executantWallets[index].signMessage(
                executantSignedDataHash
            );

            return {
                propertyownerInfo: owner,
                executantSignedDataHash,
                executantSignature, // This is now properly awaited
                _nonce: executantNonce,
            };
        })
    );

    return {
        newPropertyInfo: {
            location: randomLocation, // Ensure this matches the expected Solidity type
            uniquePropertyId: propertyId as BytesLike, // bytes32
            claimantsPublicKey: executantWallets.map(wallet => wallet.address), // Array of addresses
            encumbranceIds: [], // Empty array of whatever type encumbranceIds expect
            propertyownerInfo: randomOwners, // Add the random owner objects
        },
        ownerConsent: ownerConsent, // Consent data
        ownerList: claimantAddress
    };
}


// Function to create random property registration details
export async function createRandomPropertyRegistration(

    uniquePropertyId: BytesLike= keccak256(toUtf8Bytes(`0`)) 
, // empty for new property registration
    propertyRegistrationConsent: any, // blank for new registration
    claimantsPublicKey: any,
    requestId: BytesLike,
    saleDeedType: SaleDeedType, // default to REGISTER
    associatedPropertyId: BytesLike,
    signedDataPacket: any,
    sroWallet: any,
    sroCurrentNonce: any
) {

    const claimants = claimantsPublicKey
    const sroSignature = await signDataPacket(signedDataPacket, sroWallet)
    // Structure of the returned PropertyRegistration object
    return {
        uniquePropertyId: saleDeedType != SaleDeedType.REGISTER ? uniquePropertyId : ethers.ZeroHash ,
        ownerConsent: propertyRegistrationConsent,
        claimantsPublicKey: claimants,
        requestId,
        saleDeedType,
        associatedPropertyId: associatedPropertyId ? associatedPropertyId : '0x',
        signedDataPacket,
        sroSignature,
        _nonce: sroCurrentNonce
    };
}


// Function to sign the data packet
export async function signDataPacket(dataPacket: any, wallet: any) {

    // Sign the data packet
    const packetHash = keccak256(toUtf8Bytes(JSON.stringify(dataPacket))); // Hash the data packet
    const returnData = await wallet.signMessage(packetHash); // Sign the hashed packet
    return returnData
}


export function createRandomOwner(address: AddressLike) {

    const aadhaarHash = keccak256(toUtf8Bytes(`aadhaar_${Math.random()}`)); // Randomized Aadhaar hash
    const propertyCardId = keccak256(toUtf8Bytes(`propertyCard_${Math.random()}`)); // Random propertyCardId

    // Convert managerAddress (an Ethereum address) to bytes32
    return {
        executantPublicKey: address,
        aadhaarHash: aadhaarHash,
        uniquePropertyCardIds: propertyCardId,
        isApprovedForPOA: false,
        POAAddress: ZeroAddress,
    };
}
export function createRandomEncumbranceId() {

    const encumbranceId = keccak256(toUtf8Bytes(`encumbranceId_${Math.random()}`)); // Random propertyCardId

    return encumbranceId as BytesLike
}

// Function to add at least 3 random owners to propertyOwnerInfo
export function addRandomOwners(managerAddress: AddressLike) {
    const owners:Owner[] = [];

    // Add the manager's address as the first owner
    owners.push(createRandomOwner(managerAddress));

    // Generate at least two more random owners
    for (let i = 0; i < 2; i++) {
        const randomAddress = ethers.Wallet.createRandom().address; // Generate random Ethereum address
        owners.push(createRandomOwner(randomAddress));
    }

    // Optionally, you can add more owners if required (e.g., random between 3 and 5 owners)
    const extraOwnersCount = Math.floor(Math.random() * 3); // Add 0 to 2 more owners randomly
    for (let i = 0; i < extraOwnersCount; i++) {
        const randomAddress = ethers.Wallet.createRandom().address;
        owners.push(createRandomOwner(randomAddress));
    }

    return owners; // Return the array of owners
}

export function addKnownUsers(wallets: HardhatEthersSigner[]) {
    const owners: { executantPublicKey: AddressLike; aadhaarHash: string; uniquePropertyCardIds: string; isApprovedForPOA: boolean; POAAddress: AddressLike; }[] = [];

    // Loop through the wallet array and add each wallet's address as an owner
    wallets.forEach(wallet => {
        owners.push(createRandomOwner(wallet.address));
    });


    return owners; // Return the array of owners
}