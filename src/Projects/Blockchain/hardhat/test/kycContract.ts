// import { expect } from "chai";
// import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
// import hre, { ethers } from "hardhat";
// import { createRandomProperty } from "./helpers/Create";

// describe("KycContract", function () {

//     // We define a fixture to reuse the same setup in every test.
//     // We use loadFixture to run this setup once, snapshot that state,
//     // and reset Hardhat Network to that snapshot in every test.
//     async function deployLandModuleFixture() {

//         // Contracts are deployed using the first signer/account by default
//         const [owner, otherAccount] = await hre.ethers.getSigners();

//         const PropertyUserManagement = await hre.ethers.getContractFactory("PropertyUserManagement")
//         const propertyUserManagement=await PropertyUserManagement.deploy()
//         const addressLibPropertyManagement = await propertyUserManagement.getAddress()
      
//         const PropertyStorage = await hre.ethers.getContractFactory("PropertyStorage",{
//             libraries: {
//                 PropertyUserManagement: addressLibPropertyManagement,
//             },
//         });
//         const PropertyCardStorage = await hre.ethers.getContractFactory("PropertyCardStorage");
//         const propertyStorage = await PropertyStorage.deploy();
//         const propertyCardStorage = await PropertyCardStorage.deploy();

//         const KycContract = await hre.ethers.getContractFactory("KYCContract");
//         const kycContract = await KycContract.deploy(propertyStorage.getAddress(), propertyCardStorage.getAddress());

//         // Authorize the accounts and contracts to add a property
//         await propertyStorage.authorizeManager(owner.address); // todo later manager contract need to be authorised

//         await propertyStorage.authorizeManager(kycContract.getAddress());

//         return { propertyStorage, kycContract, propertyCardStorage, owner, otherAccount };
//     }

//     describe("Deployment", function () {
//         it("Should deploy kycContract contract", async function () {
//             const { kycContract } = await loadFixture(deployLandModuleFixture);
//             expect(kycContract).to.not.be.undefined;
//         });

//     });

//     describe("Functionality", function () {

//         it("Should check the owner of the contract", async function () {
//             const { kycContract, owner } = await loadFixture(deployLandModuleFixture);
//             expect(await kycContract.owner()).to.equal(owner.address);
//         });

//         it("Should add AAdhar hash to the property", async function () {
//             const { propertyStorage, kycContract, owner, otherAccount } = await loadFixture(deployLandModuleFixture);

//             // Create random property details

//             const propertyDetails = createRandomProperty(otherAccount.address);
//             const propertyId = propertyDetails.uniquePropertyId
//             const indexToUpdate = 0 // index at owner to update

//             //1. Create new Property
//             await propertyStorage.connect(otherAccount).addProperty(propertyId, propertyDetails.location, propertyDetails.propertyownerInfo, propertyDetails.claimantsPublicKey, []);
//             const retrievedProperty2 = await propertyStorage.getProperty(propertyId);
//             console.log("oldproperty", retrievedProperty2);

//             const newAdharToInsert = "aadharHash"
//             await kycContract.addOrUpdateaadhaarHash(propertyId, newAdharToInsert)

//             // retreive the property to match updated aadhar card
//             const retrievedProperty = await propertyStorage.getProperty(propertyId);
//             console.log(retrievedProperty);

            
//             expect(retrievedProperty.aadhaarHash).to.include(newAdharToInsert); //add check
//         });

//     });


// });
