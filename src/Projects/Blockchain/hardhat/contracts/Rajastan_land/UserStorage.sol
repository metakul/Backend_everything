// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title UserStorage
 * @dev Contract to manage property-related roles using OpenZeppelin's AccessControl. 
 * Allows different addresses to add/remove roles based on their permissions.
 */
contract UserStorage is AccessControl, Ownable {
    
    // Define role identifiers using keccak256 to generate unique role hashes
    bytes32 public constant PROPERTY_CARD_ADMIN = keccak256("PROPERTY_CARD_ADMIN");
    bytes32 public constant PROPERTY_STORAGE_ADMIN = keccak256("PROPERTY_STORAGE_ADMIN");
    bytes32 public constant ENCUMBRANCE_ADMIN = keccak256("ENCUMBRANCE_ADMIN");
    bytes32 public constant EKYC_CONTRACT_ADMIN = keccak256("EKYC_CONTRACT_ADMIN");
    bytes32 public constant SRO_ROLE = keccak256("SRO_ROLE");
    
    /**
     * @dev Constructor to initialize the contract.
     * The deployer is granted the default admin role, allowing them to grant other roles.
     */
    constructor() Ownable(msg.sender){
        // The contract deployer is automatically granted the DEFAULT_ADMIN_ROLE
     _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Grant a specific role to an account.
     * Requires that the caller has the admin role for the role being assigned.
     * @param role The role being granted (e.g., PROPERTY_CARD_ADMIN)
     * @param account The account that will receive the role
     */
    function addRole(bytes32 role, address account) public onlyOwner{
        require(
            hasRole(getRoleAdmin(role), msg.sender), 
            "Caller does not have permission to grant this role"
        );
        grantRole(role, account); // Assign the role to the account
    }

    /**
     * @dev Check if an account has a specific role.
     * @param role The role to check for (e.g., PROPERTY_CARD_ADMIN)
     * @param account The account being checked
     * @return bool True if the account has the role, otherwise false
     */
    function hasRole(bytes32 role, address account) public view override returns (bool) {
        return super.hasRole(role, account);
    }

    /**
     * @dev Revoke a role from an account.
     * Requires that the caller has the admin role for the role being revoked.
     * @param role The role being revoked (e.g., PROPERTY_CARD_ADMIN)
     * @param account The account whose role is being revoked
     */
    function removeRole(bytes32 role, address account) public onlyOwner{
        require(
            hasRole(getRoleAdmin(role), msg.sender), 
            "Caller does not have permission to revoke this role"
        );
        revokeRole(role, account); // Revoke the role from the account
    }
}
