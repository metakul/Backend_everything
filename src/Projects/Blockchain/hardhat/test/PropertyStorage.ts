// import { expect } from "chai";
// import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
// import hre from "hardhat";
// import { createRandomEncumbranceId, createRandomOwner, createRandomProperty } from "./helpers/Create";
// import { transformPropertyResult } from "./ContractHelper/GetData";

// const blankAddress = "0x0000000000000000000000000000000000000000000000000000000000000000"

// describe("LandDeploymentModule", function () {

//   // We define a fixture to reuse the same setup in every test.
//   // We use loadFixture to run this setup once, snapshot that state,
//   // and reset Hardhat Network to that snapshot in every test.
//   async function deployLandModuleFixture() {

//     // Contracts are deployed using the first signer/account by default
//     const [owner, otherAccount, secondndAccount,PoaAddress] = await hre.ethers.getSigners();

//     console.log(otherAccount.address);
//     console.log(secondndAccount.address);

//     const PropertyUserManagement = await hre.ethers.getContractFactory("PropertyUserManagement")
//     const propertyUserManagement = await PropertyUserManagement.deploy()
//     const addressLibPropertyManagement = await propertyUserManagement.getAddress()

//     const PropertyStorage = await hre.ethers.getContractFactory("PropertyStorage", {
//       libraries: {
//         PropertyUserManagement: addressLibPropertyManagement,
//       },
//     });
//     const propertyStorage = await PropertyStorage.deploy();

//     return { propertyStorage, owner, otherAccount, secondndAccount, PoaAddress };
//   }


//   describe("Deployment", function () {
//     it("Should deploy PropertyStorage contract", async function () {
//       const { propertyStorage } = await loadFixture(deployLandModuleFixture);
//       expect(propertyStorage).to.not.be.undefined;
//     });
//   });

//   describe("Functionality", function () {
//     it("Should check the owner of the contract", async function () {
//       const { propertyStorage, owner } = await loadFixture(deployLandModuleFixture);
//       expect(await propertyStorage.owner()).to.equal(owner.address);
//     });

//     it("Should authorize a manager", async function () {
//       const { propertyStorage,  otherAccount } = await loadFixture(deployLandModuleFixture);
//       expect(await propertyStorage.isAuthorizedManager(otherAccount.address)).to.be.false;
//       await propertyStorage.authorizeManager(otherAccount.address);
//       expect(await propertyStorage.isAuthorizedManager(otherAccount.address)).to.be.true;
//     });

//     it("Should Add a new property in propertyStorage", async function () {
//       const { propertyStorage, otherAccount } = await loadFixture(deployLandModuleFixture);
//       await propertyStorage.authorizeManager(otherAccount.address);

//       // Example property details and ID
//       const propertyDetails = createRandomProperty(otherAccount.address);
//       const propertyId = propertyDetails.uniquePropertyId

//       await propertyStorage.connect(otherAccount).addProperty(propertyId, propertyDetails.location, propertyDetails.propertyownerInfo, propertyDetails.claimantsPublicKey, []);

//       const retrievedProperty = await propertyStorage.getProperty(propertyId);

//       const transformedResult = transformPropertyResult(retrievedProperty)

//       expect(transformedResult).to.deep.equal(propertyDetails);
//     });

//     // it("Should emit the PropertyAdded event when adding a property", async function () {
//     //   const { propertyStorage, otherAccount } = await loadFixture(deployLandModuleFixture);

//     //   // Authorize the otherAccount to add a property
//     //   await propertyStorage.authorizeManager(otherAccount.address);

//     //   //1. Generate a unique property
//     //   const propertyDetails = createRandomProperty(otherAccount.address);
//     //   const propertyId = propertyDetails.uniquePropertyId

//     //   //2. Add Property and  Emit the event and check that each field in the struct matches the expected values
//     //   await expect(propertyStorage.connect(otherAccount).addProperty(propertyId, propertyDetails.location, propertyDetails.propertyownerInfo, propertyDetails.claimantsPublicKey, []))
//     //     .to.emit(propertyStorage, "PropertyAdded")
//     //     .withArgs(
//     //       propertyId,
//     //       [
//     //         propertyDetails.propertyownerInfo,
//     //         propertyDetails.location,
//     //         propertyDetails.uniquePropertyId,
//     //         propertyDetails.claimantsPublicKey,
//     //         propertyDetails.encumbranceIds
//     //       ]
//     //     );
//     // });

//     it("Should revert if unauthorized address tries to add a property", async function () {
//       const { propertyStorage, otherAccount } = await loadFixture(deployLandModuleFixture);

//       const propertyDetails = createRandomProperty(otherAccount.address);
//       const ownerInfo = createRandomOwner(otherAccount.address);
//       const propertyId = propertyDetails.uniquePropertyId

//       await expect(propertyStorage.connect(otherAccount).addProperty(propertyId, propertyDetails.location, [ownerInfo], propertyDetails.claimantsPublicKey, [])).to.be.revertedWith("Caller is not an authorized manager");
//     });

//     it("Should Update a property in propertyStorage", async function () {
//       const { propertyStorage, otherAccount } = await loadFixture(deployLandModuleFixture);
//       await propertyStorage.authorizeManager(otherAccount.address);

//       // Example property details and ID
//       const propertyDetails = createRandomProperty(otherAccount.address);
//       const ownerInfo = createRandomOwner(otherAccount.address);
//       const propertyId = propertyDetails.uniquePropertyId

//       await propertyStorage.connect(otherAccount).addProperty(propertyId, propertyDetails.location, [ownerInfo], propertyDetails.claimantsPublicKey, []);

//       const retrievedProperty = await propertyStorage.getProperty(propertyId);

//       const randomUpdatedPropertyDetails = createRandomProperty(otherAccount.address);

//       await propertyStorage.connect(otherAccount).updateProperty(propertyId, randomUpdatedPropertyDetails);

//       for (let i = 0; i < retrievedProperty.propertyownerInfo.length; i++) {
//         expect(retrievedProperty.propertyownerInfo[i]).to.include(otherAccount.address);
//       }
//     });

//     it("Should Update a property owner info in already created property in propertyStorage", async function () {
//       const { propertyStorage, otherAccount, secondndAccount } = await loadFixture(deployLandModuleFixture);
//       await propertyStorage.authorizeManager(otherAccount.address);

//       // Example property details and ID
//       const propertyDetails = createRandomProperty(otherAccount.address);
//       const propertyId = propertyDetails.uniquePropertyId
//       const indexToUpdate = 0 // index at owner to update

//       //1. Create new Property
//       await propertyStorage.connect(otherAccount).addProperty(propertyId, propertyDetails.location, propertyDetails.propertyownerInfo, propertyDetails.claimantsPublicKey, []);

//       //2. Create RandomOwnerInfo to update 1st owner at 0 index
//       const randomOwnerNewInfo = createRandomOwner(secondndAccount.address);

//       //3. Update owner at indexToUpdate
//       await propertyStorage.connect(otherAccount).updatePropertyOwnerInfo(propertyId, indexToUpdate, randomOwnerNewInfo.executantPublicKey, randomOwnerNewInfo.aadhaarHash, randomOwnerNewInfo.uniquePropertyCardIds);

//       const retrievedProperty = await propertyStorage.getProperty(propertyId);
//       // Unpack the result to compare values individually
//       const updatedOwnerInfo = retrievedProperty.propertyownerInfo[indexToUpdate];

//       // Compare individual properties
//       expect(updatedOwnerInfo[0]).to.equal(randomOwnerNewInfo.executantPublicKey);
//       expect(updatedOwnerInfo[1]).to.equal(randomOwnerNewInfo.aadhaarHash);
//       expect(updatedOwnerInfo[2]).to.equal(randomOwnerNewInfo.uniquePropertyCardIds);
//       expect(updatedOwnerInfo[3]).to.equal(randomOwnerNewInfo.isApprovedForPOA);
//       expect(updatedOwnerInfo[4]).to.equal(randomOwnerNewInfo.POAAddress);

//     });

//     it("Should update propertyDetails, delete old owner array & update new property owner in propertyStorage", async function () {
//       const { propertyStorage, otherAccount } = await loadFixture(deployLandModuleFixture);
//       await propertyStorage.authorizeManager(otherAccount.address);

//       // Example property details and ID
//       const propertyDetails = createRandomProperty(otherAccount.address);
//       const propertyId = propertyDetails.uniquePropertyId
//       const indexToUpdate = 0

//       //1. Create new Property
//       await propertyStorage.connect(otherAccount).addProperty(propertyId, propertyDetails.location, propertyDetails.propertyownerInfo, propertyDetails.claimantsPublicKey, []);

//       //2. Generate new random PropertyDetails
//       const randomUpdatedPropertyDetails = createRandomProperty(otherAccount.address);

//       //3. Update Proeprty
//       await propertyStorage.connect(otherAccount).updateProperty(propertyId, randomUpdatedPropertyDetails);

//       const retrievedProperty = await propertyStorage.getProperty(propertyId);

//       expect(retrievedProperty.propertyownerInfo[indexToUpdate].executantPublicKey).to.include(otherAccount.address);
//     });

//     it("Should Delete an old property in propertyStorage", async function () {
//       const { propertyStorage, otherAccount } = await loadFixture(deployLandModuleFixture);
//       await propertyStorage.authorizeManager(otherAccount.address);

//       // Example property details and ID
//       const propertyDetails = createRandomProperty(otherAccount.address);
//       const propertyId = propertyDetails.uniquePropertyId;

//       // 1. Create new Property
//       await propertyStorage.connect(otherAccount).addProperty(propertyId, propertyDetails.location, propertyDetails.propertyownerInfo, propertyDetails.claimantsPublicKey, []);

//       // 2. Delete Property
//       await propertyStorage.connect(otherAccount).deleteProperty(propertyId);

//       // 3. Attempt to retrieve the deleted property
//       const retrievedProperty = await propertyStorage.getProperty(propertyId);

//       // Check that propertyownerInfo is an empty array
//       expect(retrievedProperty[0]).to.deep.equal([]);
//       expect(retrievedProperty[1]).to.equal('');
//       expect(retrievedProperty[2]).to.equal(blankAddress);
//       expect(retrievedProperty[3]).to.deep.equal([]);
//       expect(retrievedProperty[4]).to.deep.equal([]);
//     });

//     it("Should Add Incumbrance to the property", async function () {
//       const { propertyStorage, otherAccount } = await loadFixture(deployLandModuleFixture);
//       await propertyStorage.authorizeManager(otherAccount.address);

//       // Example property details and ID
//       const propertyDetails = createRandomProperty(otherAccount.address);
//       const propertyId = propertyDetails.uniquePropertyId;

//       // 1. Create new Property
//       await propertyStorage.connect(otherAccount).addProperty(propertyId, propertyDetails.location, propertyDetails.propertyownerInfo, propertyDetails.claimantsPublicKey, []);

//       // 2. Generate encumbrance
//       const encumbranceIds = [createRandomEncumbranceId(), createRandomEncumbranceId()]

//       // 3. Add Encumbrance Property
//       for (let i = 0; i < encumbranceIds.length; i++) {
//         await propertyStorage.connect(otherAccount).addEncumbranceToProperty(propertyId, encumbranceIds[i]);
//       }

//       // 4. retrieve the Property property
//       const retrievedProperty = await propertyStorage.getProperty(propertyId);

//       // Check if the encumbrance Id at index[4] is equal to the id we sent
//       expect(retrievedProperty.encumbranceIds).to.deep.equal(encumbranceIds);
//     });
//     it("Should Update Incumbrance to the property", async function () {
//       const { propertyStorage, otherAccount } = await loadFixture(deployLandModuleFixture);
//       await propertyStorage.authorizeManager(otherAccount.address);

//       // Example property details and ID
//       const propertyDetails = createRandomProperty(otherAccount.address);
//       const propertyId = propertyDetails.uniquePropertyId;

//       // 1. Create new Property
//       await propertyStorage.connect(otherAccount).addProperty(propertyId, propertyDetails.location, propertyDetails.propertyownerInfo, propertyDetails.claimantsPublicKey, []);

//       // 2. Generate encumbrance
//       const encumbranceIds = [createRandomEncumbranceId(), createRandomEncumbranceId()]

//       // 3. Add Encumbrance Property
//       for (let i = 0; i < encumbranceIds.length; i++) {
//         await propertyStorage.connect(otherAccount).addEncumbranceToProperty(propertyId, encumbranceIds[i]);
//       }

//       // 4. retrieve the Property property
//       const retrievedProperty = await propertyStorage.getProperty(propertyId);

//       // Check if the encumbrance Id at index[4] is equal to the id we sent
//       expect(retrievedProperty.encumbranceIds).to.deep.equal(encumbranceIds);
//     });

//     it("Should add and update encumbrances to the property", async function () {
//       const { propertyStorage, otherAccount } = await loadFixture(deployLandModuleFixture);
//       await propertyStorage.authorizeManager(otherAccount.address);

//       // Example property details and ID
//       const propertyDetails = createRandomProperty(otherAccount.address);
//       const propertyId = propertyDetails.uniquePropertyId;

//       // 1. Create new Property
//       await propertyStorage.connect(otherAccount).addProperty(
//         propertyId,
//         propertyDetails.location,
//         propertyDetails.propertyownerInfo,
//         propertyDetails.claimantsPublicKey,
//         []
//       );

//       // 2. Generate encumbrance
//       const encumbranceIds = [createRandomEncumbranceId(), createRandomEncumbranceId()];

//       // 3. Add Encumbrance Property
//       for (let i = 0; i < encumbranceIds.length; i++) {
//         await propertyStorage.connect(otherAccount).addEncumbranceToProperty(propertyId, encumbranceIds[i]);
//       }

//       // 4. Retrieve the Property property
//       let retrievedProperty = await propertyStorage.getProperty(propertyId);

//       // Check if the encumbranceIds is equal to the ids we sent
//       expect(retrievedProperty.encumbranceIds).to.deep.equal(encumbranceIds);

//       // 5. Remove encumbrances from property
//       for (let i = 0; i < encumbranceIds.length; i++) {
//         await propertyStorage.connect(otherAccount).removeEncumbranceFromProperty(propertyId, encumbranceIds[i]);
//       }
//       // 6. Retrieve the Property property again to ensure encumbrances are removed
//       retrievedProperty = await propertyStorage.getProperty(propertyId);

//       // 7. Filter out '0x000...' entries from the encumbrance array (assuming removal zeroes the IDs)
//       const filteredEncumbrances = retrievedProperty.encumbranceIds.filter(
//         (id) => id !== blankAddress
//       );

//       // 8. Check if the filtered encumbranceIds array is empty after removal
//       expect(filteredEncumbrances).to.deep.equal([]);
//     });
    
//     it("Should set and delete the POA APPROVAL for a property.", async function () {
//       const { propertyStorage, otherAccount, PoaAddress } = await loadFixture(deployLandModuleFixture);
//       await propertyStorage.authorizeManager(otherAccount.address);

//       // Example property details and ID
//       const propertyDetails = createRandomProperty(otherAccount.address);
//       const propertyId = propertyDetails.uniquePropertyId;
//       const ownerIndexForPoa = 1;

//       // 1. Create new Property
//       await propertyStorage.connect(otherAccount).addProperty(
//         propertyId,
//         propertyDetails.location,
//         propertyDetails.propertyownerInfo,
//         propertyDetails.claimantsPublicKey,
//         []
//       );

//       // 3. Add PoaApproval for a specific Property + Property owner
//       await propertyStorage.connect(otherAccount)["setPoaApproval(bytes32,uint256,bool,address)"](propertyId, ownerIndexForPoa, true, PoaAddress.address);

//       // 4. Retrieve the Property property
//       let retrievedProperty = await propertyStorage.getProperty(propertyId);

//       // Check if the POA is true/valid for ownerIndexForPoa
//       expect(retrievedProperty.propertyownerInfo[ownerIndexForPoa].POAAddress).to.deep.equal(PoaAddress.address);
//       expect(retrievedProperty.propertyownerInfo[ownerIndexForPoa].isApprovedForPOA).to.deep.equal(true);

//       // 5. Remove POA Approval from property
//       await propertyStorage.connect(otherAccount)["setPoaApproval(bytes32,uint256,bool)"](propertyId, ownerIndexForPoa, false);

//       // 6. Retrieve the Property property again to ensure POA approval is removed
//       retrievedProperty = await propertyStorage.getProperty(propertyId);

//       // 8. Check if the POAAddress is reset to the blank address after removal
//       expect(retrievedProperty.propertyownerInfo[ownerIndexForPoa].POAAddress).to.deep.equal(blankAddress);
//       expect(retrievedProperty.propertyownerInfo[ownerIndexForPoa].isApprovedForPOA).to.deep.equal(false);
//     });

//   });


// });
