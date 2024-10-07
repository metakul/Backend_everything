// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.2;

import "../PropertyStorage.sol";
import "../DataTypes.sol";

contract PoaContract {
    PropertyStorage public propertyStorage;

    // Constructor to set the address of PropertyStorage contract
    constructor(address _propertyStorage) {
        propertyStorage = PropertyStorage(_propertyStorage);
    }

    /**
     * @dev Set the POA approval status and address for a property.
     * @param propertyId Unique identifier for the property.
     * @param isApproved Status indicating if the property is approved by POA.
     * @param poaAddress Address of the POA.
     */
    function setPoaApproval(
        bytes32 propertyId,
        bool isApproved,
        address poaAddress,
        uint256 ownerIndex
    ) external {
        propertyStorage.setPoaApproval(
            propertyId,
            ownerIndex,
            isApproved,
            poaAddress
        );
    }

    /**
     * @dev Update the POA approval status and address for a property.
     * @param propertyId Unique identifier for the property.
     * @param isApproved Status indicating if the property is approved by POA.
     * @param poaAddress Address of the POA.
     */
    function updatePoaApproval(
        bytes32 propertyId,
        bool isApproved,
        address poaAddress,
        uint256 ownerIndex
    ) external {
        propertyStorage.setPoaApproval(
            propertyId,
            ownerIndex,
            isApproved,
            poaAddress
        );
    }

    /**
     * @dev Retrieve the POA approval status and address for a property.
     * @param propertyId Unique identifier for the property.
     * @return isApproved Status indicating if the property is approved by POA.
     * @return poaAddress Address of the POA.
     */
    function getPoaApproval(
        bytes32 propertyId,
        uint256 ownerIndex
    ) external view returns (bool isApproved, address poaAddress) {
        return propertyStorage.getPoaApproval(propertyId, ownerIndex);
    }

    /**
     * @dev Remove POA approval status and address for a property.
     */
    function removePoaApproval(
        bytes32 propertyId,
        bool isApproved,
        address poaAddress,
        uint256 ownerIndex
    ) external {
        propertyStorage.setPoaApproval(
            propertyId,
            ownerIndex,
            isApproved,
            poaAddress
        );
    }
}
