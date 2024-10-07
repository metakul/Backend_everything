// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.2;

import "./DataTypes.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./lib/PropertyUserManagement.sol"; // Import the updated library;

contract PropertyStorage is Ownable {
    using DataTypes for *;
    using PropertyUserManagement for DataTypes.PropertyownerInfo;

    address[] private authorizedManagers;

    mapping(address => bool) private isManagerAuthorized;

    // Mapping unique property identifier to Property Details
    mapping(bytes32 => DataTypes.PropertyDetails) public PropertyRecord;

    // Events for CRUD operations
    event PropertyAdded(
        bytes32 indexed propertyId,
        DataTypes.PropertyDetails details
    );
    event PropertyUpdated(
        bytes32 indexed propertyId,
        DataTypes.PropertyDetails details
    );
    event PropertyDeleted(bytes32 indexed propertyId);
    event AadhaarHashUpdated(bytes32 indexed propertyId, string aadhaarHash);
    event PoaApprovedUpdated(
        bytes32 indexed propertyId,
        bool isApproved,
        address POAAddress
    );
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
     * @dev Constructor for initializing the PropertyManager contract owner.
     */

    constructor() Ownable(msg.sender) {}

/**
 * @dev Add a new property to the record.
 * @param propertyId Unique identifier for the property.
 */
function addProperty(
     bytes32 propertyId,
        string memory _location,
        DataTypes.PropertyownerInfo[] memory _propertyownerInfo, // todo change this to merkle hash
        address[] memory _claimantsPublicKey,
        bytes32[] memory _encumbranceIds
) external onlyAuthorizedManager {
    require(
        PropertyRecord[propertyId].uniquePropertyId == bytes32(0),
        "Property already exists"
    );


        DataTypes.PropertyDetails storage newProperty = PropertyRecord[propertyId];
        newProperty.location = _location;
        newProperty.uniquePropertyId = propertyId;
        newProperty.claimantsPublicKey = _claimantsPublicKey;
        newProperty.encumbranceIds = _encumbranceIds;

        // Save the property to the mapping
        PropertyRecord[propertyId] = newProperty;

        for (uint256 i = 0; i < _propertyownerInfo.length; i++) {
            DataTypes.PropertyownerInfo memory propertyOwner = DataTypes
                .PropertyownerInfo({
                    executantPublicKey: _propertyownerInfo[i]
                        .executantPublicKey,
                    aadhaarHash: _propertyownerInfo[i].aadhaarHash,
                    uniquePropertyCardIds: _propertyownerInfo[i]
                        .uniquePropertyCardIds,
                    isApprovedForPOA: _propertyownerInfo[i].isApprovedForPOA,
                    POAAddress: _propertyownerInfo[i].POAAddress
                });
            addPropertyOwner(propertyId, propertyOwner);
        }

    emit PropertyAdded(propertyId, newProperty);
}

/**
 * @dev Update an existing property.
 * @param propertyId Unique identifier for the property.
 * @param details Updated property details.
 */
function updateProperty(
    bytes32 propertyId,
    DataTypes.PropertyDetails memory details
) external onlyAuthorizedManager {
    require(
        PropertyRecord[propertyId].uniquePropertyId != bytes32(0),
        "Property does not exist"
    );

    // Update other details directly
    PropertyRecord[propertyId].location = details.location;
    PropertyRecord[propertyId].uniquePropertyId = details.uniquePropertyId;
    PropertyRecord[propertyId].claimantsPublicKey = details.claimantsPublicKey;
    PropertyRecord[propertyId].encumbranceIds = details.encumbranceIds;

    // Update propertyownerInfo array manually
    DataTypes.PropertyownerInfo[] storage oldOwners = PropertyRecord[propertyId].propertyownerInfo;
    
    // Clear the old array
    delete PropertyRecord[propertyId].propertyownerInfo;

    // Add the new owners one by one
    for (uint256 i = 0; i < details.propertyownerInfo.length; i++) {
        oldOwners.push(details.propertyownerInfo[i]);
    }

    emit PropertyUpdated(propertyId, details);
}



    /**
     * @dev Delete a property from the record.
     * @param propertyId Unique identifier for the property to delete.
     */
    function deleteProperty(bytes32 propertyId) external onlyAuthorizedManager {
        require(
            PropertyRecord[propertyId].uniquePropertyId != bytes32(0),
            "Property does not exist"
        );
        delete PropertyRecord[propertyId];
        emit PropertyDeleted(propertyId);
    }

    /**
     * @dev Retrieve property details.
     * @param propertyId Unique identifier for the property.
     * @return PropertyDetails Struct containing property details.
     */
    function getProperty(
        bytes32 propertyId
    ) public view returns (DataTypes.PropertyDetails memory) {
        require(
            PropertyRecord[propertyId].uniquePropertyId.length > 0,
            "Property does not exist"
        );
        return PropertyRecord[propertyId];
    }


    // CRUD function for adharHash:

    /**
     * @dev Retrieve the Aadhaar hash for a property.
     * @param propertyId Unique identifier for the property.
     * @return aadhaarHash The Aadhaar hash associated with the property.
     */
    function getAadhaarHash(
        bytes32 propertyId
    ) external view returns (string[] memory) {
        DataTypes.PropertyDetails storage propertyDetails = PropertyRecord[
            propertyId
        ];
        require(
            propertyDetails.uniquePropertyId != bytes32(0),
            "Property does not exist"
        );

        // Create an array to hold the Aadhaar hashes
        string[] memory aadhaarHashes = new string[](
            propertyDetails.propertyownerInfo.length
        );

        // Populate the Aadhaar hashes array
        for (uint256 i = 0; i < propertyDetails.propertyownerInfo.length; i++) {
            aadhaarHashes[i] = propertyDetails.propertyownerInfo[i].aadhaarHash;
        }

        return aadhaarHashes;
    }

    /**
     * @dev Add a new encumbrance to a property.
     * @param propertyId Unique identifier for the property.
     */
    function addEncumbranceToProperty(
        bytes32 propertyId,
        bytes32 encumbranceId
    ) external onlyAuthorizedManager {
        // Get the property details from storage
        DataTypes.PropertyDetails storage propertyDetails = PropertyRecord[
            propertyId
        ];

        require(
            propertyDetails.uniquePropertyId != 0,
            "Property does not exist"
        );

        // Push to the storage array
        propertyDetails.encumbranceIds.push(encumbranceId);
        emit PropertyUpdated(propertyId, propertyDetails);
    }

    /**
     * @dev Update an existing encumbrance on a property.
     * @param propertyId Unique identifier for the property.
     */
    function updateEncumbranceInProperty(
        bytes32 propertyId,
        bytes32 encumbranceId
    ) external onlyAuthorizedManager {
        DataTypes.PropertyDetails storage propertyDetails = PropertyRecord[
            propertyId
        ];

        require(
            propertyDetails.uniquePropertyId != 0,
            "Property does not exist"
        );

        bool encumbranceFound = false;
        for (uint256 i = 0; i < propertyDetails.encumbranceIds.length; i++) {
            if (
                keccak256(
                    abi.encodePacked(propertyDetails.encumbranceIds[i])
                ) == keccak256(abi.encodePacked(encumbranceId))
            ) {
                propertyDetails.encumbranceIds[i] = encumbranceId;
                encumbranceFound = true;
                break;
            }
        }

        require(
            encumbranceFound,
            "Encumbrance not found for the specified type"
        );
        emit PropertyUpdated(propertyId, propertyDetails);
    }

    /**
     * @dev Check if a property has any active encumbrance.
     * @param propertyId Unique identifier for the property.
     * @return encumbranceIds Array of active encumbrance IDs.
     * @return hasEncumbrance Returns true if any encumbrance is active, false otherwise.
     */
    function checkEncumbrance(
        bytes32 propertyId
    )
        external
        view
        returns (bytes32[] memory encumbranceIds, bool hasEncumbrance)
    {
        DataTypes.PropertyDetails memory propertyDetails = getProperty(
            propertyId
        );
        require(
            propertyDetails.uniquePropertyId != 0,
            "Property does not exist"
        );

        // Check if the property has any encumbrances
        if (propertyDetails.encumbranceIds.length > 0) {
            return (propertyDetails.encumbranceIds, true);
        }

        return (propertyDetails.encumbranceIds, false); // Returns empty array if no encumbrances
    }

    /**
     * @dev Remove an encumbrance from a property.
     * @param propertyId Unique identifier for the property.
     * @param encumbranceId Id of encumbrance to remove.
     */
    function removeEncumbranceFromProperty(
        bytes32 propertyId,
        bytes32 encumbranceId
    ) external onlyAuthorizedManager {
        DataTypes.PropertyDetails storage propertyDetails = PropertyRecord[
            propertyId
        ];

        require(
            propertyDetails.uniquePropertyId != 0,
            "Property does not exist"
        );

        bool encumbranceFound = false;
        for (uint256 i = 0; i < propertyDetails.encumbranceIds.length; i++) {
            if (
                keccak256(
                    abi.encodePacked(propertyDetails.encumbranceIds[i])
                ) == keccak256(abi.encodePacked(encumbranceId))
            ) {
                delete propertyDetails.encumbranceIds[i];
                encumbranceFound = true;
                break;
            }
        }

        require(
            encumbranceFound,
            "Encumbrance not found for the specified type"
        );
        emit PropertyUpdated(propertyId, propertyDetails);
    }

    // CRUD function for isApprovedForPOA and POAAddress

/**
 * @dev Set the approval status and POA address for a property.
 * @param propertyId Unique identifier for the property.
 * @param ownerIndex Index of the property owner in the propertyownerInfo array.
 * @param isApproved Status indicating if the property is approved by POA.
 * @param POAAddress Address of the POA.
 */
function setPoaApproval(
    bytes32 propertyId,
    uint256 ownerIndex,
    bool isApproved,
    address POAAddress
) public onlyAuthorizedManager {
    DataTypes.PropertyDetails storage propertyDetails = PropertyRecord[
        propertyId
    ];

    require(
        propertyDetails.uniquePropertyId != bytes32(0),
        "Property does not exist"
    );

    // Ensure the ownerIndex is valid
    require(
        ownerIndex < PropertyRecord[propertyId].propertyownerInfo.length,
        "Invalid owner index"
    );

    // Update POA approval and address for the specified property owner
    propertyDetails.propertyownerInfo[ownerIndex].isApprovedForPOA = isApproved;

    if (isApproved) {
        propertyDetails.propertyownerInfo[ownerIndex].POAAddress = POAAddress;
    } else {
        propertyDetails.propertyownerInfo[ownerIndex].POAAddress = address(0); // Remove the POA address if not approved
    }

    emit PoaApprovedUpdated(propertyId, isApproved, POAAddress);
}

/**
 * @dev Set the approval status for a property without a POA address.
 * @param propertyId Unique identifier for the property.
 * @param ownerIndex Index of the property owner in the propertyownerInfo array.
 * @param isApproved Status indicating if the property is approved by POA.
 */
function setPoaApproval(
    bytes32 propertyId,
    uint256 ownerIndex,
    bool isApproved
) external onlyAuthorizedManager {
    // Call the main function with the zero address for POA
    setPoaApproval(propertyId, ownerIndex, isApproved, address(0));
}


    /**
     * @dev Retrieve the POA approval status and address for a property.
     * @param propertyId Unique identifier for the property.
     * @return isApproved Status indicating if the property is approved by POA.
     * @return POAAddress Address of the POA.
     */
    function getPoaApproval(
        bytes32 propertyId,
        uint256 ownerIndex
    ) external view returns (bool isApproved, address POAAddress) {
        DataTypes.PropertyDetails memory propertyDetails = PropertyRecord[
            propertyId
        ];

        require(
            propertyDetails.uniquePropertyId != bytes32(0),
            "Property does not exist"
        );

        // Ensure the ownerIndex is valid
        require(
            ownerIndex < propertyDetails.propertyownerInfo.length,
            "Invalid owner index"
        );

        return (
            propertyDetails.propertyownerInfo[ownerIndex].isApprovedForPOA,
            propertyDetails.propertyownerInfo[ownerIndex].POAAddress
        );
    }

    
    /**
     * @dev Add a new property owner to the existing property.
     * @param propertyId Unique identifier for the property.
     * @param ownerInfo Property owner details to add.
     */
    function addPropertyOwner(
        bytes32 propertyId,
        DataTypes.PropertyownerInfo memory ownerInfo
    ) internal onlyAuthorizedManager {
        require(
            PropertyRecord[propertyId].uniquePropertyId != bytes32(0),
            "Property does not exist"
        );

        // Use the library to update property owner information
        PropertyRecord[propertyId].propertyownerInfo.push(ownerInfo);
        emit PropertyUpdated(propertyId, PropertyRecord[propertyId]);
    }

    /**
     * @dev Update property owner information.
     * @param propertyId Unique identifier for the property.
     * @param ownerIndex Index of the property owner to update.
     * @param _executantPublicKey New public key of the executant.
     * @param _aadhaarHash New Aadhaar hash.
     * @param _uniquePropertyCardIds New unique property card IDs.
     */
    function updatePropertyOwnerInfo(
        bytes32 propertyId,
        uint256 ownerIndex,
        address _executantPublicKey,
        string memory _aadhaarHash,
        bytes32 _uniquePropertyCardIds
    ) external onlyAuthorizedManager {
        require(
            PropertyRecord[propertyId].uniquePropertyId != bytes32(0),
            "Property does not exist"
        );
        require(
            ownerIndex < PropertyRecord[propertyId].propertyownerInfo.length,
            "Invalid property owner index"
        );

        // Use the library to update property owner information
        PropertyRecord[propertyId]
            .propertyownerInfo[ownerIndex]
            .updatePropertyownerInfo(
                _executantPublicKey,
                _aadhaarHash,
                _uniquePropertyCardIds
            );

        emit PropertyUpdated(propertyId, PropertyRecord[propertyId]);
    }

    /**
     * @dev Validate the property owner info (this case aadhar) for a specific property.
     * @param propertyId Unique identifier for the property.
     * @param propertyDetails The new PropertyDetails to validate against the existing one.
     * @return isValid A boolean indicating if the property details are valid.
     */
    function validatePropertyInfo(
        bytes32 propertyId,
        DataTypes.PropertyDetails memory propertyDetails
    ) external view returns (bool isValid) {
        // Retrieve the existing PropertyRecord
        DataTypes.PropertyDetails storage oldPropertyRecord = PropertyRecord[
            propertyId
        ];

        require(
            propertyDetails.uniquePropertyId != 0,
            "Property does not exist"
        );

        // Validate new details against the old details
        isValid = PropertyUserManagement.validatePropertyOwners(
            propertyDetails,
            oldPropertyRecord
        );

        return isValid;
    }

    /**
     * @dev Check if a specific owner address is in the executantPublicKey array of a property
     * @param uniquePropertyId Unique property identifier
     * @param ownerAddress Address to check
     * @return bool True if the owner address is found, false otherwise
     */
    function isOwnerAddressPresent(
        bytes32 uniquePropertyId,
        address ownerAddress
    ) public view returns (bool) {
        DataTypes.PropertyDetails memory propertyDetails = getProperty(
            uniquePropertyId
        );

        for (uint256 i = 0; i < propertyDetails.propertyownerInfo.length; i++) {
            if (
                propertyDetails.propertyownerInfo[i].executantPublicKey ==
                ownerAddress
            ) {
                return true;
            }
        }

        return false;
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
