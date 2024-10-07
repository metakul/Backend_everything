// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "../DataTypes.sol";

library PropertyUserManagement {

    using DataTypes for *;


    // Update property owner information in a single transaction
    function updatePropertyownerInfo(
        DataTypes.PropertyownerInfo storage self,
        address _executantPublicKey,
        string memory _aadhaarHash,
        bytes32 _uniquePropertyCardIds
    ) public {
        self.executantPublicKey = _executantPublicKey;
        self.aadhaarHash = _aadhaarHash;
        self.uniquePropertyCardIds = _uniquePropertyCardIds;
    }

    // Delete property owner information in a single transaction
    function deletePropertyownerInfo(DataTypes.PropertyownerInfo storage self) public {
        delete self.executantPublicKey;
        delete self.aadhaarHash;
        delete self.uniquePropertyCardIds;
    }

    // Validate if the property owner info exists (non-empty fields)
    function validatePropertyownerInfo(DataTypes.PropertyownerInfo storage self) public view returns (bool) {
        return (
            self.executantPublicKey != address(0) &&
            bytes(self.aadhaarHash).length > 0 &&
            self.uniquePropertyCardIds != bytes32(0)
        );
    }

    function validatePropertyOwners(
        DataTypes.PropertyDetails memory newRecord,
        DataTypes.PropertyDetails storage oldRecord
    ) internal view returns (bool) {
        if (newRecord.uniquePropertyId != oldRecord.uniquePropertyId) {
            return false;
        }

        // Check if the lengths of property owner info match
        if (newRecord.propertyownerInfo.length != oldRecord.propertyownerInfo.length) {
            return false;
        }

        // Additional validation logic can go here...
        for (uint256 i = 0; i < newRecord.propertyownerInfo.length; i++) {
            if (keccak256(abi.encodePacked(newRecord.propertyownerInfo[i].aadhaarHash)) !=
                keccak256(abi.encodePacked(oldRecord.propertyownerInfo[i].aadhaarHash))) {
                return false;
            }
        }

        return true; // All validations passed
    }

}
