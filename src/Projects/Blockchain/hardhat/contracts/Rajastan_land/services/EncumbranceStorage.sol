// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.2;

import "../DataTypes.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EncumbranceStorage is Ownable {

    address[] private authorizedManagers;

    mapping(address => bool) private isManagerAuthorized;

    // Mapping to store encumbrances by a unique identifier (encumbranceId)
    mapping(bytes32 => DataTypes.EncumbranceDetails) private encumbrances;

    // Event to emit when a new encumbrance is created
    event EncumbranceCreated(
        bytes32 indexed encumbranceId,
        string encumbranceType,
        string encumbranceHolderPublicKey,
        uint256 encumbranceTimePeriod
    );

    // Event to emit when an encumbrance is updated
    event EncumbranceUpdated(
        bytes32 indexed encumbranceId,
        string encumbranceType,
        string encumbranceHolderPublicKey,
        uint256 encumbranceTimePeriod
    );

    // Event to emit when an encumbrance is deleted
    event EncumbranceDeleted(bytes32 indexed encumbranceId);

    // Events For authorising Manager
    event ManagerAuthorized(address managerAddress);
    event ManagerUnAuthorized(address managerAddress);


    // Modifier to check if an encumbrance exists
    modifier encumbranceExists(bytes32 encumbranceId) {
        require(
            encumbrances[encumbranceId].exists,
            "Encumbrance does not exist"
        );
        _;
    }

    // Modifier to restrict access to only authorized manager contracts
    modifier onlyAuthorizedManager() {
        require(
            isManagerAuthorized[msg.sender],
            "Caller is not an authorized manager"
        );
        _;
    }

    /**
     * @dev Constructor to set the owner address.
    */

    constructor() Ownable(msg.sender) {}

    // Function to create a new encumbrance
    function createEncumbrance(
        string memory _encumbranceType,
        string memory _encumbranceHolderPublicKey,
        uint256 _encumbranceTimePeriod
    ) public onlyAuthorizedManager returns (bytes32) {
        // Generate a random encumbranceId using keccak256 hash
        bytes32 encumbranceId = keccak256(
            abi.encodePacked(
                _encumbranceType,
                _encumbranceHolderPublicKey,
                block.timestamp,
                block.prevrandao
            )
        );

        // Ensure the encumbrance does not already exist
        require(
            !encumbrances[encumbranceId].exists,
            "Encumbrance already exists"
        );

        // Create a new encumbrance
        encumbrances[encumbranceId] = DataTypes.EncumbranceDetails({
            encumbranceType: _encumbranceType,
            encumbranceHolderPublicKey: _encumbranceHolderPublicKey,
            encumbranceTimePeriod: _encumbranceTimePeriod,
            exists: true
        });

        // Emit event for creation
        emit EncumbranceCreated(
            encumbranceId,
            _encumbranceType,
            _encumbranceHolderPublicKey,
            _encumbranceTimePeriod
        );

        return encumbranceId;
    }

    // Function to get details of an encumbrance
    function getEncumbrance(
        bytes32 encumbranceId
    )
        public
        view
        encumbranceExists(encumbranceId)
        returns (DataTypes.EncumbranceDetails memory)
    {
        DataTypes.EncumbranceDetails memory encumbrance = encumbrances[encumbranceId];
        return encumbrance;
    }

    // Function to update an existing encumbrance
    function updateEncumbrance(
        bytes32 encumbranceId,
        string memory _encumbranceType,
        string memory _encumbranceHolderPublicKey,
        uint256 _encumbranceTimePeriod
    ) public onlyAuthorizedManager encumbranceExists(encumbranceId) {
        DataTypes.EncumbranceDetails storage encumbrance = encumbrances[encumbranceId];
        encumbrance.encumbranceType = _encumbranceType;
        encumbrance.encumbranceHolderPublicKey = _encumbranceHolderPublicKey;
        encumbrance.encumbranceTimePeriod = _encumbranceTimePeriod;

        // Emit event for update
        emit EncumbranceUpdated(
            encumbranceId,
            _encumbranceType,
            _encumbranceHolderPublicKey,
            _encumbranceTimePeriod
        );
    }

    // Function to delete an encumbrance
    function deleteEncumbrance(
        bytes32 encumbranceId
    ) public onlyAuthorizedManager encumbranceExists(encumbranceId) {
        delete encumbrances[encumbranceId];

        // Emit event for deletion
        emit EncumbranceDeleted(encumbranceId);
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
