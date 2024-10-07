// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.2;

import "../DataTypes.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../PropertyStorage.sol";
import "../PropertyCardStorage.sol";

contract KYCContract is Ownable {
    using DataTypes for *;

    // Instance of PropertyStorage contract
    PropertyStorage public propertyStorageContract;

    // Instance of PropertyCard Storage
    PropertyCardStorage private propertyCardStorage;

    // Constructor to set the addresses of the VerifySignature and PropertyStorage contracts
    constructor(
        address _propertyStorageAddress,
        address _propertyCardAddress
    ) Ownable(msg.sender) {
        propertyStorageContract = PropertyStorage(_propertyStorageAddress); // Initialize PropertyStorage
        propertyCardStorage = PropertyCardStorage(_propertyCardAddress);
    }

    // Function to add or update aadhaarHash in the PropertyStorage
    function addOrUpdateaadhaarHash(
        bytes32 _propertyId,
        string memory _aadhaarHash
    ) public onlyOwner {
        // Retrieve the property details from PropertyStorage
        DataTypes.PropertyDetails
            memory propertyDetails = propertyStorageContract.getProperty(
                _propertyId
            );

        // Check if the property exists
        require(
            propertyDetails.uniquePropertyId != 0,
            "Property does not exist"
        );

        // Update the property details back in PropertyStorage
        // propertyStorageContract.setAadhaarHash(_propertyId, _aadhaarHash);
    }

    // Function to verify EKYC signature
    function verifySignature(
        address _signer,
        bytes32 messageHash,
        uint256 _nonce,
        bytes memory _signature
    ) public view returns (bool) {
        // Verify signature
        // return
        //     verify(
        //     _signer,
        //     address(this),
        //     0, // Amount is not used in EKYC verification
        //     string(abi.encodePacked(messageHash)),
        //     _nonce,
        //     _signature
        // );

        return true;
    }

    // Function to verify land owner signature (stub function)
    function verifyLandOwnerSignature(
        address _signer,
        bytes32 messageHash,
        uint256 _nonce,
        bytes memory _signature
    ) public pure returns (bool, address) {
        // TODO: Implement actual verification logic, this is a stub function
        // recover address
        // get proof and match with merkle hash of property owners
        // ! Always return true and the address of the same _signer

        bytes32 senderAddressBytes32 = bytes32(uint256(uint160(_signer)));
        return (true, _signer);
    }

    // Function to compute the message hash for EKYC data
    function getEKYCMessageHash(
        DataTypes.EKYC memory _ekycData
    ) public pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    _ekycData.name,
                    _ekycData.dob,
                    _ekycData.gender,
                    _ekycData.aadhaarHash,
                    _ekycData.addressInfo,
                    _ekycData.contactInfo,
                    _ekycData.proof
                )
            );
    }

    /**
     * @dev Common validation function for encumbrance operations.
     * @param propertyReg The property registration data.
     */
    function validateTransactionForProperty(
        DataTypes.PropertyRegistration memory propertyReg,
        bool signedBySro
    ) public view returns (bool success, string memory message) {
        if (signedBySro) {
            if (
                !verifySignature(
                    msg.sender,
                    propertyReg.signedDataPacket,
                    propertyReg._nonce,
                    propertyReg.sroSignature
                )
            ) {
                return (false, "Invalid SRO signature");
            }
        }

        DataTypes.PropertyDetails
            memory existingPropertyDetails = propertyStorageContract
                .getProperty(propertyReg.uniquePropertyId);

        // verify ownership consent
        for (uint256 i = 0; i < propertyReg.ownerConsent.length; i++) {
            bytes memory signature = propertyReg
                .ownerConsent[i]
                .executantSignature;
            bytes32 signedData = propertyReg
                .ownerConsent[i]
                .executantSignedDataHash;
            address ownerAddress = existingPropertyDetails
                .propertyownerInfo[i]
                .executantPublicKey;

            require(
                existingPropertyDetails
                    .propertyownerInfo[i]
                    .uniquePropertyCardIds ==
                    propertyReg
                        .ownerConsent[i]
                        .propertyownerInfo
                        .uniquePropertyCardIds,
                "Property Card Verification failed"
            );

            // todo get user from userStorage to check if institution
            DataTypes.Executant memory executant;
            // try
            //     propertyCardStorage.getUserForCard(
            //         propertyReg
            //             .ownerConsent[i]
            //             .propertyownerInfo
            //             .uniquePropertyCardIds
            //     )
            // returns (DataTypes.Executant memory _executant) {
            //     executant = _executant;
            // } catch Error(string memory reason) {
            //     // This will catch any revert reason provided in the `getUserForCard` function
            //     revert(reason); // You can log this reason or return it as required
            // } catch (bytes memory lowLevelData) {
            //     // This will catch any low-level errors that don't have a revert reason string
            //     revert("Failed to retrieve executant: Low-level error");
            // }

            (bool isValid, address recoveredAddress) = verifyLandOwnerSignature(
                ownerAddress,
                signedData,
                propertyReg._nonce,
                signature
            );

            if (!isValid) {
                return (false, "Invalid Executant signature");
            }

            // check card for Institution
            if (!executant.institution.isInstitution) {
                require(
                    keccak256(
                        abi.encodePacked(
                            propertyStorageContract.getAadhaarHash(
                                propertyReg.uniquePropertyId
                            )[i]
                        )
                    ) ==
                        keccak256(
                            abi.encodePacked(
                                propertyReg
                                    .ownerConsent[i]
                                    .propertyownerInfo
                                    .aadhaarHash
                            )
                        ),
                    "AADHAAR Verification failed"
                );
            }

            require(
                propertyStorageContract.isOwnerAddressPresent(
                    propertyReg.uniquePropertyId,
                    recoveredAddress
                ),
                "Address not present in owner list of propertyDetails."
            );
        }

        return (true, "Validation successful");
    }
}
