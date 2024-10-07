// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../DataTypes.sol";
import "../PropertyStorage.sol";
import "./KYCContract.sol";
import "./EncumbranceStorage.sol";

/**
 * @title Encumbrance
 * @dev Contract to manage encumbrances on properties.
 */

contract Encumbrance is Ownable {
    using DataTypes for *;

    PropertyStorage public propertyStorage;
    KYCContract public kycContract;
    EncumbranceStorage public encumbranceStorage;

    // Events for CRUD operations related to encumbrance
    event EncumbranceAdded(bytes32 indexed propertyId, bytes32 encumbranceId);
    event EncumbranceUpdated(bytes32 indexed propertyId, bytes32 encumbranceId);
    event EncumbranceRemoved(bytes32 indexed propertyId, bytes32 encumbranceId);

    constructor(
        address _propertyStorageAddress,
        address _kycContractAddress,
        address _encumbranceStorageAddress
    ) Ownable(msg.sender) {
        propertyStorage = PropertyStorage(_propertyStorageAddress);
        kycContract = KYCContract(_kycContractAddress);
        encumbranceStorage = EncumbranceStorage(_encumbranceStorageAddress);
    }

    /**
     * @dev Add an encumbrance to a property.
     * @param encumbranceType Type of the encumbrance (e.g., mortgage, lien, etc.).
     * @param encumbranceHolderPublicKey Public key of the encumbrance holder.
     * @param encumbranceTimePeriod Duration of the encumbrance in seconds.
     * @param propertyReg Property registration details.
     */
    function addEncumbranceToProperty(
        string memory encumbranceType,
        string memory encumbranceHolderPublicKey,
        uint256 encumbranceTimePeriod,
        DataTypes.PropertyRegistration memory propertyReg
        // todo get propertyID instead
    ) external onlyOwner {
        if (
            propertyReg.uniquePropertyId == bytes32(0) &&
            propertyReg.saleDeedType == DataTypes.SaleDeedType.REGISTER
        ) {
            // Create a new encumbrance in EncumbranceStorage and get its ID
            bytes32 encumbranceId = encumbranceStorage.createEncumbrance(
                encumbranceType,
                encumbranceHolderPublicKey,
                encumbranceTimePeriod
            );
            propertyStorage.addEncumbranceToProperty(
                propertyReg.uniquePropertyId,
                encumbranceId
            );
            emit EncumbranceAdded(propertyReg.uniquePropertyId, encumbranceId);
        } else {
            (bool success, string memory message) = kycContract
                .validateTransactionForProperty(propertyReg, false);
            if (!success) {
                revert(message); // Revert with the failure message
            }
            // Create a new encumbrance in EncumbranceStorage and get its ID
            bytes32 encumbranceId = encumbranceStorage.createEncumbrance(
                encumbranceType,
                encumbranceHolderPublicKey,
                encumbranceTimePeriod
            );
            // Call the function in propertyStorage to modify the property
            propertyStorage.addEncumbranceToProperty(
                propertyReg.uniquePropertyId,
                encumbranceId
            );
            emit EncumbranceAdded(propertyReg.uniquePropertyId, encumbranceId);
        }
    }

    /**
     * @dev Update an encumbrance on a property.
     * @param propertyId Unique identifier for the property.
     * @param encumbranceId Id of encumbrance.
     */
    function updateEncumbrance(
        bytes32 propertyId,
        bytes32 encumbranceId,
        string memory encumbranceType,
        string memory encumbranceHolderPublicKey,
        uint256 encumbranceTimePeriod,
        DataTypes.PropertyRegistration memory propertyReg
    ) external onlyOwner {
        (bool success, string memory message) = kycContract
            .validateTransactionForProperty(propertyReg, false);
        if (!success) {
            revert(message); // Revert with the failure message
        }

        // Update the encumbrance details in EncumbranceStorage
        encumbranceStorage.updateEncumbrance(
            encumbranceId,
            encumbranceType,
            encumbranceHolderPublicKey,
            encumbranceTimePeriod
        );

        // Emit event for the update
        emit EncumbranceUpdated(propertyId, encumbranceId);
    }

    /**
     * @dev Remove an encumbrance from a property.
     * @param propertyId Unique identifier for the property.
     * @param encumbranceId Id of encumbrance to be removed.
     */
    function removeEncumbrance(
        bytes32 propertyId,
        bytes32 encumbranceId,
        DataTypes.PropertyRegistration memory propertyReg
    ) external onlyOwner {
        (bool success, string memory message) = kycContract
            .validateTransactionForProperty(propertyReg, false);
        if (!success) {
            revert(message); // Revert with the failure message
        }
        propertyStorage.removeEncumbranceFromProperty(
            propertyId,
            encumbranceId
        );

        encumbranceStorage.deleteEncumbrance(
            encumbranceId
        );

        emit EncumbranceRemoved(propertyId, encumbranceId);
    }

    /**
     * @dev Check if a property has any active encumbrance.
     * @param encumbranceId Unique identifier for the property.
     */
    function checkEncumbrance(
        bytes32 encumbranceId
    )
        external
        view
          returns (DataTypes.EncumbranceDetails memory)
    {
        return encumbranceStorage.getEncumbrance(encumbranceId);
    }
}
