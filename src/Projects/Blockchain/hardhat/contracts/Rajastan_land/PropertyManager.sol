// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.2;

import "./PropertyStorage.sol";
import "./DataTypes.sol";
import "./services/KYCContract.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PropertyManager
 * @dev Contract to manage property registrations and related deeds such as sale, gift, rectification, and cancellation deeds.
 */
contract PropertyManager is Ownable {
    using DataTypes for *;

    // Contract state variables
    PropertyStorage public propertyStorage;
    KYCContract public kycContract;

    /**
     * @dev Constructor for initializing the PropertyManager contract with relevant contract addresses.
     * @param _storageAddress Address of the PropertyStorage contract
     * @param _kycContractAddress Address of the KYCContract contract for verification
     */
    constructor(
        address _storageAddress,
        address _kycContractAddress
    ) Ownable(msg.sender) {
        propertyStorage = PropertyStorage(_storageAddress);
        kycContract = KYCContract(_kycContractAddress);
    }

    /**
     *
     * @dev Register a new or existing property.
     * @param propertyReg.executantSignedData The executant’s digitally signed index data
     * @param propertyReg.requestId Unique request identifier for the property registration
     * @param propertyReg.aadhaarHash E-verified Aadhaar number hash * @param saleDeedType Type of sale deed (SALE_DEED, GIFT_DEED, RECTIFICATION_DEED, CANCELLATION_DEED)
     * @param propertyReg.uniquePropertyId Unique property identifier (empty if new registration)
     * @param propertyReg.associatedPropertyId If uniquePropertyId is empty, it links to the current property for part-sale (only for sale deeds)
     * @param propertyReg.uniquePropertyCardIds Array of property card identifiers linked to the registration
     * @param propertyReg.executantSignature Signatures of the executants
     * @param propertyReg.signedDataPacket Data packet signed by executants and others
     * @param propertyReg.sroSignature Signature of the Sub-Registrar Office (SRO) for verification
     * @param propertyReg._nonce Nonce used for signature verification
     */
    function registerPropertyDeeds(
        DataTypes.PropertyRegistration memory propertyReg
    ) public {
        // Verify the SRO signature
            DataTypes.PropertyDetails
                memory existingPropertyDetails = propertyStorage.getProperty(
                    propertyReg.uniquePropertyId
                );

            // Revert if encumbrances exist, displaying the IDs for reference
            require(
                existingPropertyDetails.encumbranceIds.length == 0,
                string(
                    abi.encodePacked(
                        "Active encumbrance found: ",
                        existingPropertyDetails.encumbranceIds
                    )
                )
            );

            // todo check if POA on behalf of owner if yes: verify  owner approval and POA  verificaton else validate owner

            // verify executant signature as owner
            (bool success, string memory message) = kycContract
                .validateTransactionForProperty(propertyReg, false);
            if (!success) {
                revert(message); // Revert with the failure message
            }

            // Create an array to store all executant public keys
            address[] memory executantPublicKeys = new address[](
                propertyReg.ownerConsent.length
            );

            // Loop through the ownerConsent array to extract each executant's public key
            for (uint256 i = 0; i < propertyReg.ownerConsent.length; i++) {
                // Access the executant public key from the PropertyownerInfo struct
                executantPublicKeys[i] = propertyReg
                    .ownerConsent[i]
                    .propertyownerInfo
                    .executantPublicKey;
            }
            // Register an existing property based on the deed type
            if (propertyReg.saleDeedType == DataTypes.SaleDeedType.SALE_DEED) {
                registerSaleDeed(
                    existingPropertyDetails,
                    executantPublicKeys,
                    propertyReg.claimantsPublicKey,
                    propertyReg.uniquePropertyId
                );
            }
            // Handle Gift Deed registration (Bifurcation)
            else if (
                propertyReg.saleDeedType == DataTypes.SaleDeedType.GIFT_DEED
            ) {
                registerGiftDeed(
                    existingPropertyDetails,
                    executantPublicKeys,
                    propertyReg.claimantsPublicKey,
                    propertyReg.uniquePropertyId,
                    propertyReg.associatedPropertyId
                );
            }
            // Handle Rectification Deed registration
            else if (
                propertyReg.saleDeedType ==
                DataTypes.SaleDeedType.RECTIFICATION_DEED
            ) {
                registerRectificationDeed(
                    existingPropertyDetails,
                    executantPublicKeys,
                    propertyReg.claimantsPublicKey,
                    propertyReg.uniquePropertyId
                );
            }
            // Handle Cancellation Deed registration
            else if (
                propertyReg.saleDeedType ==
                DataTypes.SaleDeedType.CANCELLATION_DEED
            ) {
                registerCancellationDeed(
                    existingPropertyDetails,
                    executantPublicKeys,
                    propertyReg.claimantsPublicKey,
                    propertyReg.uniquePropertyId
                );
            }
        }


    /**
     *
     * @dev Register a new or existing property.
     * @dev same Overloading for new Property registration
     * @param propertyDetails Details of the property being registered
     *
     */
    function registerProperty(
        DataTypes.PropertyRegistration memory propertyReg,
        DataTypes.PropertyDetails memory propertyDetails // Empty if not new registration
    ) public {
        // Verify the SRO signature
        require(
            kycContract.verifySignature(
                msg.sender,
                propertyReg.signedDataPacket,
                propertyReg._nonce,
                propertyReg.sroSignature
            ),
            "Invalid SRO signature"
        );

        //  Register a new property if no uniquePropertyId is provided

        // New property registration
        registerNewProperty(
            propertyReg.associatedPropertyId,
            propertyReg.claimantsPublicKey,
            propertyDetails
        );
    }

    /**
     * @dev Register a new property.
     * @param executantPublicKey Addresses of the executants (which will become claimants)
     * @param propertyDetails Details of the property being registered
     */
    function registerNewProperty(
        bytes32 associatedPropertyId,
        address[] memory executantPublicKey,
        DataTypes.PropertyDetails memory propertyDetails
    ) internal {
        // TODO: Generate a new temporary property ID, and update the property details (e.g., dimensions, area) by adjusting the area for part-sale transactions.
        // Set the executant addresses as the owner public keys
        propertyDetails.claimantsPublicKey = executantPublicKey;
        // propertyDetails.propertyCardIds = uniquePropertyCardIds;

        // ! For now, saving the same associatedPropertyId getting from propertyDetails struct for the new property
        // Add the new property details to storage
        propertyStorage.addProperty(
            associatedPropertyId,
            propertyDetails.location,
            propertyDetails.propertyownerInfo,
            executantPublicKey,
            propertyDetails.encumbranceIds
        );
    }

    function registerSaleDeed(
        DataTypes.PropertyDetails memory propertyDetails,
        address[] memory executantPublicKey,
        address[] memory claimantsPublicKey,
        bytes32 uniquePropertyId
    ) internal {
        require(executantPublicKey.length > 0, "Executant addresses required");
        require(claimantsPublicKey.length > 0, "Claimant addresses required");

        // Transfer ownership to the new claimants (buyers)
        propertyDetails.claimantsPublicKey = claimantsPublicKey;
        propertyStorage.updateProperty(uniquePropertyId, propertyDetails);
    }

    function registerGiftDeed(
        DataTypes.PropertyDetails memory propertyDetails,
        address[] memory executantPublicKey,
        address[] memory claimantsPublicKey,
        bytes32 uniquePropertyId,
        bytes32 associatedPropertyId
    ) internal {
        require(executantPublicKey.length > 0, "Executant addresses required");
        require(claimantsPublicKey.length > 0, "Claimant addresses required");
        // todo generate new propertyDetails to register it as new property to claim
        // todo add check if gifting whole property or part
        registerNewProperty(
            associatedPropertyId,
            claimantsPublicKey,
            propertyDetails // todo Need to update this after generating new property from old one
        );
        // Update ownership to the recipient's address (gifted party)
        propertyDetails.claimantsPublicKey = claimantsPublicKey;
        propertyStorage.updateProperty(uniquePropertyId, propertyDetails);
    }

    function registerRectificationDeed(
        DataTypes.PropertyDetails memory propertyDetails,
        address[] memory executantPublicKey,
        address[] memory claimantsPublicKey,
        bytes32 uniquePropertyId
    ) internal {
        require(executantPublicKey.length > 0, "Executant addresses required");

        propertyDetails.claimantsPublicKey = claimantsPublicKey;
        // Correct property details and keep the ownership unchanged
        propertyStorage.updateProperty(uniquePropertyId, propertyDetails);
    }

    function registerCancellationDeed(
        DataTypes.PropertyDetails memory propertyDetails,
        address[] memory executantPublicKey,
        address[] memory claimantsPublicKey,
        bytes32 uniquePropertyId
    ) internal {
        require(executantPublicKey.length > 0, "Executant addresses required");
        require(
            claimantsPublicKey.length ==
                propertyDetails.claimantsPublicKey.length,
            "Claimants info Wrong Received"
        );
        // Clear the claimantsPublicKey array in the property details
        delete propertyDetails.claimantsPublicKey;

        // Update the property with the modified details (without claimantsPublicKey)
        propertyStorage.updateProperty(uniquePropertyId, propertyDetails);
    }

    function fetchProperty(
        bytes32 uniquePropertyId
    ) public view returns( DataTypes.PropertyDetails memory) {
       

        // Update the property with the modified details (without claimantsPublicKey)
        return propertyStorage.getProperty(uniquePropertyId);
    }

    // Helper functions

    // TODO: Add error handling and events to notify the successful registration of properties.
    // TODO: Add a fallback mechanism to handle cases where SRO signatures or KYC verifications fail due to timeouts.
}
