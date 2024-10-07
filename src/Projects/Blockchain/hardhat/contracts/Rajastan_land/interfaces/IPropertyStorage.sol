// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.2;

import "../DataTypes.sol";

interface IPropertyStorage {
    function getProperty(bytes32 propertyId) external view returns (DataTypes.PropertyDetails memory);
    function updateProperty(bytes32 propertyId, DataTypes.PropertyDetails memory details) external;
}
