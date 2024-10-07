// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.2;

import "./DataTypes.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract PropertyCardStorage is Ownable {

    address[] private authorizedManagers;

    mapping(address => bool) private isManagerAuthorized;

    // Mapping from propertyCard to an array of PropertyDetails (One-to-Many)
    mapping(bytes32 => bytes32[]) private MapPropertyCardToProperty;

    // Mapping from propertyCard to user (Executant)
    mapping(bytes32 => DataTypes.Executant) private MapCardToUser;

    // Events
    event PropertyAdded(bytes32 indexed propertyCard, bytes32 propertyId);
    event PropertyUpdated(bytes32 indexed propertyCard, uint256 index, bytes32 propertyId);
    event PropertyRemoved(bytes32 indexed propertyCard, uint256 index);
    event UserLinkedToCard(bytes32 indexed propertyCard, bytes32 indexed aadhaarHash);
    event ManagerAuthorized(address managerAddress);
    event ManagerUnAuthorized(address managerAddress);

    // Modifier to restrict access to only authorized manager contracts
    modifier onlyAuthorizedManager() {
        require(
            isManagerAuthorized[msg.sender],
            "Caller is not an authorized manager"
        );
        _;
    }

    /**
     * @dev Constructor for initializing the PropertyCard contract owner.
     */

    constructor() Ownable(msg.sender) {}

    // Add propertyCard to propertyId (CREATE)
    function addPropertyToCard(bytes32 propertyCard, bytes32 propertyId) public onlyAuthorizedManager{
        MapPropertyCardToProperty[propertyCard].push(propertyId);  // Add to the array
        emit PropertyAdded(propertyCard, propertyId);
    }

    // Retrieve all property id for a card (READ)
    function getPropertyForCard(bytes32 propertyCard) public view returns (bytes32[] memory) {
        require(MapPropertyCardToProperty[propertyCard].length > 0, "No properties exist for this card");
        return MapPropertyCardToProperty[propertyCard];
    }

    // Update a specific property detail by index (UPDATE)
    function updatePropertyForCard(bytes32 propertyCard, uint256 index, bytes32 propertyId) public onlyAuthorizedManager{
        require(MapPropertyCardToProperty[propertyCard].length > 0, "No properties exist for this card");
        require(index < MapPropertyCardToProperty[propertyCard].length, "Invalid index");
        MapPropertyCardToProperty[propertyCard][index] = propertyId;
        emit PropertyUpdated(propertyCard, index, propertyId);
    }

    // Remove property detail by index (DELETE)
    function removePropertyFromCard(bytes32 propertyCard, uint256 index) public onlyAuthorizedManager{
        require(MapPropertyCardToProperty[propertyCard].length > 0, "No properties exist for this card");
        require(index < MapPropertyCardToProperty[propertyCard].length, "Invalid index");

        // Remove property by swapping with the last element and then popping the array
        uint256 lastIndex = MapPropertyCardToProperty[propertyCard].length - 1;
        if (index != lastIndex) {
            MapPropertyCardToProperty[propertyCard][index] = MapPropertyCardToProperty[propertyCard][lastIndex];
        }
        MapPropertyCardToProperty[propertyCard].pop();  // Remove last element

        emit PropertyRemoved(propertyCard, index);
    }

    // Add card to user (Executant) (CREATE)
    function addCardToUser(bytes32 propertyCard, DataTypes.Executant memory executant) public onlyAuthorizedManager {
        require(MapCardToUser[propertyCard].aadhaarHash == bytes32(0), "Card already linked to user");
        MapCardToUser[propertyCard] = executant;
    }

    // Retrieve user (Executant) for a card (READ)
    function getUserForCard(bytes32 propertyCard) public view returns (DataTypes.Executant memory) {
        require(MapCardToUser[propertyCard].aadhaarHash != bytes32(0), "No user linked to card");
        return MapCardToUser[propertyCard];
    }

    // Update user (Executant) for a card (UPDATE)
    function updateUserForCard(bytes32 propertyCard, DataTypes.Executant memory executant) public onlyAuthorizedManager {
        require(MapCardToUser[propertyCard].aadhaarHash != bytes32(0), "No user linked to card");
        MapCardToUser[propertyCard] = executant;
    }

    // Remove card-to-user mapping (DELETE)
    function removeUserForCard(bytes32 propertyCard) public onlyAuthorizedManager {
        require(MapCardToUser[propertyCard].aadhaarHash != bytes32(0), "No user linked to card");
        delete MapCardToUser[propertyCard];
    }

        /**
     * @dev Authorizes a manager contract to interact with this storage contract.
     * Can only be called by the contract owner (this should be implemented as per your access control requirements).
     * @param manager The address of the manager contract to authorize.
     */
    function authorizeManager(address manager) external onlyOwner {
        authorizedManagers.push(manager);
        isManagerAuthorized[manager] = true;
        emit ManagerAuthorized(manager);
    }

    /**
     * @dev Deauthorizes a manager contract from interacting with this storage contract.
     * Can only be called by the contract owner.
     * @param manager The address of the manager contract to deauthorize.
     */
    function deauthorizeManager(address manager) external onlyOwner {
        isManagerAuthorized[manager] = false;
        emit ManagerUnAuthorized(manager);
    }

       /**
     * @dev Returns the list of authorized managers.
     * @return An array of addresses that are authorized managers.
     */
    function getAuthorizedManagers() external view returns (address[] memory) {
        return authorizedManagers;
    }

    /**
     * @dev Checks if a specific address is an authorized manager.
     * @param manager The address to check.
     * @return bool True if the address is authorized, otherwise false.
     */
    function isAuthorizedManager(address manager) external view returns (bool) {
        return isManagerAuthorized[manager];
    }
}
