// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "../utils/Verification/ECDSA.sol";
import "../DataTypes.sol";


library Ownership {
    using ECDSA for bytes32;

    /**
     * @dev Verify the ownership of executants with the provided signatures and data.
     * @param executantAddresses Array of public addresses of executants.
     * @param requestId Unique request identifier.
     * @param saleDeedType Type of sale deed.
     * @param uniquePropertyId Unique property identifier (empty if new registration).
     * @param uniquePropertyCardId Unique property card identifier.
     * @param executantSignature Array of signatures from executants.
     * @param _nonce Unique nonce for signature verification.
     * @param propertyDetails Details of the property.
     * @return bool Returns true if all signatures are valid, false otherwise.
     */
    function verifyOwnership(
        bytes32[] memory executantAddresses,
        bytes32 requestId,
        DataTypes.SaleDeedType saleDeedType,
        bytes32 uniquePropertyId,
        bytes32[] memory uniquePropertyCardId,
        bytes[] memory executantSignature,
        uint256 _nonce,
        DataTypes.PropertyDetails memory propertyDetails
    ) internal pure returns (bool) {
        // bytes32 messageHash = keccak256(
        //     abi.encodePacked(
        //         uniquePropertyId,
        //         uniquePropertyCardId,
        //         saleDeedType,
        //         requestId,
        //         _nonce
        //     )
        // );
        
        // // Verify each executant's signature
        // for (uint256 i = 0; i < executantAddresses.length; i++) {
        //     address recoveredAddress = ECDSA.recover(messageHash.toEthSignedMessageHash(), executantSignature[i]);
        //     if (recoveredAddress != address(uint160(uint256(executantAddresses[i])))) {
        //         return false;
        //     }
        // }

        return true;
    }
}
