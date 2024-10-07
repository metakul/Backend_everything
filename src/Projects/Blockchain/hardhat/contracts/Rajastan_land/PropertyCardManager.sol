// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.2;

import "./DataTypes.sol";
import "./services/KYCContract.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./PropertyCardStorage.sol";
import "./PropertyStorage.sol";

contract PropertyCardManager is Ownable {
    // External Contracts
    PropertyStorage public propertyStorage;
    KYCContract public kycContract;

    PropertyCardStorage private propertyCardStorage;

    /**
     * @dev Constructor to set the KYC contract address.
     * @param _kycContractAddress Address of the KYC contract.
     */
    constructor(
        address _storageAddress,
        address _kycContractAddress,
        address propertyCardAddress
    ) Ownable(msg.sender) {
        propertyStorage = PropertyStorage(_storageAddress);
        kycContract = KYCContract(_kycContractAddress);
        propertyCardStorage = PropertyCardStorage(propertyCardAddress);
    }

    /**
     * @dev Map owner to property card after verifying EKYC signature.
     * @param encryptedExecutantDetails The property holder’s personal details received using e-KYC encrypted via private key within property Card.
     * TODO Create a function to update name, only for institutional cards.
     *
     * This function first verifies the EKYC signature using the provided KYC contract.
     * If the signature is valid, it updates or adds the property owner to the mapping.
     * It ensures that only verified owners with valid EKYC signatures can be added or updated.
     *
     * @dev Requirements:
     * - The EKYC signature must be valid.
     * @dev Future Updates:
     * - Update the verifyEKYCSignature to check if the kyc is being checked by required officer
     */

    function addOrUpdateOwnerOfPropertyCard(
        DataTypes.Executant[] memory encryptedExecutantDetails,
        DataTypes.PropertyRegistration memory propertyReg

    ) public onlyOwner {

        // verify the signature and trx via ekyc
        // Verify signature using the KYC contract is it was send by DEO
        (bool success, string memory message) = kycContract
            .validateTransactionForProperty(propertyReg, true);
        if (!success) {
            revert(message); // Revert with the failure message
        }

        // fetch the property record from blockchain via propertyID for publicKey
        // Uplaod Property record via constructor and get details of property via propertyStorage
        DataTypes.PropertyDetails
            memory existingPropertyDetails = propertyStorage.getProperty(
                propertyReg.uniquePropertyId
            );

        // map user to card
        for (uint256 i = 0; i < propertyReg.ownerConsent.length; i++) {

            bytes32 propertyCardIdHash = propertyReg.ownerConsent[i].propertyownerInfo.uniquePropertyCardIds;
            DataTypes.Executant
                memory executantDetails = encryptedExecutantDetails[i];

            // Save the array of encrypted details to the corresponding property card ID hash
            propertyCardStorage.addCardToUser(
                propertyCardIdHash,
                executantDetails
            );

            // Update the mapping of owner to property card hashes
            propertyCardStorage.addPropertyToCard(
                propertyCardIdHash,
                existingPropertyDetails.uniquePropertyId
            );
        }
    }
}
