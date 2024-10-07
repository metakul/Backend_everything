import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import hre, { ethers } from "hardhat";
import { createPropertyWithUserConsent,    createRandomPropertyRegistration } from "./helpers/Create";
import { transformPropertyResult } from "./ContractHelper/GetData";
import { BytesLike,  keccak256, toUtf8Bytes } from "ethers";
import { SaleDeedType } from "./DataTypes/DataTypes";

describe("LandDeploymentModule", function () {

    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployLandModuleFixture() {

        // Contracts are deployed using the first signer/account by default
        const [owner,  PoaWallet ,sroWallet,ca1,ca2,ca3,ea1,ea2,ea3] = await hre.ethers.getSigners();

        const claimantsWallet = [ca1, ca2, ca3]
        const executantsWallet = [ea1, ea2, ea3]

        // deploy lib for property
        const PropertyUserManagement = await hre.ethers.getContractFactory("PropertyUserManagement")
        const propertyUserManagement = await PropertyUserManagement.deploy()
        const addressLibPropertyManagement = await propertyUserManagement.getAddress()

        // deploy propertyStorage
        const PropertyStorage = await hre.ethers.getContractFactory("PropertyStorage", {
            libraries: {
                PropertyUserManagement: addressLibPropertyManagement,
            },
        });
        const propertyStorage = await PropertyStorage.deploy();

        // deploy propertyStorage
        const KYCContract = await hre.ethers.getContractFactory("KYCContract")
        const kycContract = await KYCContract.deploy(propertyStorage.getAddress(), propertyStorage.getAddress());

        // deploy propertyManager
        const PropertyManager = await hre.ethers.getContractFactory("PropertyManager")
        const propertyManager = await PropertyManager.deploy(propertyStorage.getAddress(), kycContract.getAddress());

        // authorize manager contract to handle propertyStorage
        await propertyStorage.authorizeManager(propertyManager.getAddress())

        return { propertyStorage, propertyManager, owner, PoaWallet, sroWallet, claimantsWallet, executantsWallet };
    }


    describe("Deployment", function () {
        it("Should deploy PropertyStorage contract", async function () {
            const { propertyStorage, propertyManager } = await loadFixture(deployLandModuleFixture);
            expect(propertyStorage).to.not.be.undefined;
            expect(propertyManager).to.not.be.undefined;
        });
    });

    describe("Functionality", function () {
        it("Should check the owner of the contract", async function () {
            const { propertyStorage, propertyManager, owner, } = await loadFixture(deployLandModuleFixture);
            expect(await propertyManager.owner()).to.equal(owner.address);
            expect(await propertyStorage.owner()).to.equal(owner.address);
        });
        it("Should check the PropertyStorage address of the contract", async function () {
            const { propertyStorage, propertyManager, owner, } = await loadFixture(deployLandModuleFixture);
            const propertyId = keccak256(toUtf8Bytes(`unique_property_id_${Math.random()}`)); // Randomized property ID

            const propertyInfo = await propertyManager.fetchProperty(propertyId)
            console.log(propertyInfo);
            
            
            expect(await propertyStorage.owner()).to.equal(owner.address);
        });


        it("Should Add a new property in propertyStorage via manager", async function () {
            const { propertyStorage, propertyManager, sroWallet,executantsWallet } = await loadFixture(deployLandModuleFixture);

            // todo add userManager and provide a role to sro
            // for now not checking role only signature

            const requestId = keccak256(toUtf8Bytes(`request_id_${Math.random()}`)); // Randomized property ID

            // fetch Nonce of SRO 
            const sroCurrentNonce = 2
            const executantNonce=3
            
            // Generate a new  property details to register and ID
            const propertyDetails =await createPropertyWithUserConsent(executantsWallet, executantNonce, false);
            const associatedPropertyId = propertyDetails.newPropertyInfo.uniquePropertyId

            // Create Data Packet to signed by sro
            const signedDataPacket = keccak256(toUtf8Bytes(`sro_packet_data_${Math.random()}`)) as BytesLike  // todo get the struct to sign

            const propertyRegDetails =await createRandomPropertyRegistration(
                propertyDetails.newPropertyInfo.uniquePropertyId, 
                propertyDetails.ownerConsent,
                propertyDetails.ownerList,
                requestId,
                SaleDeedType.REGISTER,
                associatedPropertyId,
                signedDataPacket,
                sroWallet,
                sroCurrentNonce
            )

            // add property Via Manager File
            await propertyManager.connect(sroWallet).registerProperty(propertyRegDetails, propertyDetails.newPropertyInfo);

            const retrievedProperty = await propertyStorage.getProperty(associatedPropertyId);

            const transformedResult = transformPropertyResult(retrievedProperty)

            expect(transformedResult).to.deep.equal(propertyDetails.newPropertyInfo);
        });

        it("Should Regsiter SALE_DEED for new property sale to new claimants in propertyStorage via manager", async function () {
            const { propertyStorage, propertyManager, sroWallet,executantsWallet,claimantsWallet } = await loadFixture(deployLandModuleFixture);

            // todo add userManager and provide a role to sro
            // for now not checking role only signature

            const requestId = keccak256(toUtf8Bytes(`request_id_${Math.random()}`)); // Randomized property ID

            // fetch Nonce of SRO 
            const sroCurrentNonce = 2
            const executantNonce=3
            
            // Generate a new  property details to register and ID
            const propertyDetails =await createPropertyWithUserConsent(executantsWallet, executantNonce, false);
            let  associatedPropertyId = propertyDetails.newPropertyInfo.uniquePropertyId

            // Create Data Packet to signed by sro
            const signedDataPacket = keccak256(toUtf8Bytes(`sro_packet_data_${Math.random()}`)) as BytesLike  // todo get the struct to sign

            const propertyRegDetails =await createRandomPropertyRegistration(
                propertyDetails.newPropertyInfo.uniquePropertyId, 
                propertyDetails.ownerConsent,
                propertyDetails.ownerList,
                requestId,
                SaleDeedType.REGISTER,
                associatedPropertyId,
                signedDataPacket,
                sroWallet,
                sroCurrentNonce
            )

            // add property Via Manager File
            await propertyManager.connect(sroWallet).registerProperty(propertyRegDetails, propertyDetails.newPropertyInfo);

            const retrievedProperty = await propertyStorage.getProperty(associatedPropertyId);
            
            const transformedResult = transformPropertyResult(retrievedProperty)

            // Start sale deed
            const newOwnersAddress =await claimantsWallet.map((wallet) => wallet.address);

            const propertyRegDetails_SALE_DEED = await createRandomPropertyRegistration(
                transformedResult.uniquePropertyId,
                propertyDetails.ownerConsent,
                newOwnersAddress,
                requestId,
                SaleDeedType.SALE_DEED,
                associatedPropertyId = ethers.ZeroHash,
                signedDataPacket,
                sroWallet,
                sroCurrentNonce
            )

            await propertyManager.connect(sroWallet).registerPropertyDeeds(propertyRegDetails_SALE_DEED);

        });

    });

});
