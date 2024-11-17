// import { expect } from "chai";
// import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
// import hre from "hardhat";
// import { keccak256, toUtf8Bytes } from "ethers";

// describe("PropertyCardModule", function () {

//     // We define a fixture to reuse the same setup in every test.
//     // We use loadFixture to run this setup once, snapshot that state,
//     // and reset Hardhat Network to that snapshot in every test.
//     async function deployLandModuleFixture() {

//         // Contracts are deployed using the first signer/account by default
//         const [owner, otherAccount, secondndAccount, PoaAddress] = await hre.ethers.getSigners();

//         const PropertyCardStorage = await hre.ethers.getContractFactory("PropertyCardStorage");
//         const propertyCardStorage = await PropertyCardStorage.deploy();

//         return { propertyCardStorage, owner, otherAccount, secondndAccount, PoaAddress };
//     }


//     describe("Deployment", function () {
//         it("Should deploy PropertyCardStorage contract", async function () {
//             const { propertyCardStorage } = await loadFixture(deployLandModuleFixture);
//             expect(propertyCardStorage).to.not.be.undefined;
//         });
//     });

//     describe("Functionality", function () {
//         it("Should check the owner of the contract", async function () {
//             const { propertyCardStorage, owner } = await loadFixture(deployLandModuleFixture);
//             expect(await propertyCardStorage.owner()).to.equal(owner.address);
//         });

//         it("Should add propertyId to propertyCard", async function () {
//             const { propertyCardStorage, owner } = await loadFixture(deployLandModuleFixture);
//             await propertyCardStorage.authorizeManager(owner.address);

//             const propertyCardId = keccak256(toUtf8Bytes("unique_property_card"));
//             const propertyId = keccak256(toUtf8Bytes("unique_property"));

//             await propertyCardStorage.connect(owner).addPropertyToCard(propertyCardId, propertyId);

//             const retrievedPropertyCardInfo = await propertyCardStorage.getPropertyForCard(propertyCardId);

//             expect(retrievedPropertyCardInfo).to.deep.equal([propertyId]);
//         });

        
//         it("Should remove propertyId from propertyCard", async function () {
//             const { propertyCardStorage, owner } = await loadFixture(deployLandModuleFixture);

//             // Authorize manager
//             await propertyCardStorage.authorizeManager(owner.address);

//             // Create propertyCardId and propertyId using keccak256 hash
//             const propertyCardId = keccak256(toUtf8Bytes("unique_property_card"));
//             const propertyId = keccak256(toUtf8Bytes("unique_property"));
//             const propertyId2 = keccak256(toUtf8Bytes("unique_property_id2"));

//             // Add the property to the card
//             await propertyCardStorage.connect(owner).addPropertyToCard(propertyCardId, propertyId);
//             await propertyCardStorage.connect(owner).addPropertyToCard(propertyCardId, propertyId2);

//             // Retrieve the propertyCardInfo and check if propertyId was added
//             const retrievedPropertyCardInfo = await propertyCardStorage.getPropertyForCard(propertyCardId);
//             expect(retrievedPropertyCardInfo).to.include(propertyId); // Check if the property was added

//             // Now, remove the propertyId from the card
//             await propertyCardStorage.connect(owner).removePropertyFromCard(propertyCardId, 0);

//             // Retrieve propertyCardInfo after removal
//             const updatedPropertyCardInfo = await propertyCardStorage.getPropertyForCard(propertyCardId);

//             // Expect the propertyId to be removed (updated array should not include propertyId)
//             expect(updatedPropertyCardInfo).to.not.include(propertyId);
//         });
//     })
// })