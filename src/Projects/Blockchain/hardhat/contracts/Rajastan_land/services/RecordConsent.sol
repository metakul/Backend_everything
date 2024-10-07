// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.2;
/**
 * @title ConsentRegistry
 * @dev This contract allows users to record and manage their consents on the blockchain.
 */
contract ConsentRegistry {
    /**
     * @dev Struct to hold consent information.
     * @param consentingParty The address of the party who gave consent.
     * @param consentType A string describing the type of consent.
     * @param timestamp The block timestamp when the consent was recorded.
     * @param metadata Additional information related to the consent.
     */
    struct Consent {
        address consentingParty;
        string consentType;
        uint256 timestamp;
        string metadata;
    }

    // Mapping to store consent records by a unique consent ID
    mapping(uint256 => Consent) public consents;
    uint256 public nextConsentId;

    /**
     * @dev Emitted when a consent is successfully recorded.
     * @param consentId The ID of the recorded consent.
     * @param consentingParty The address of the party who gave consent.
     * @param consentType The type of consent.
     * @param timestamp The block timestamp when the consent was recorded.
     * @param metadata Additional information related to the consent.
     */
    event ConsentRecorded(
        uint256 indexed consentId,
        address indexed consentingParty,
        string consentType,
        uint256 timestamp,
        string metadata
    );

    /**
     * @dev Records a new consent.
     * @param consentType A string describing the type of consent.
     * @param metadata Additional information related to the consent.
     * @notice The caller’s address is recorded as the consenting party.
     * Emits a {ConsentRecorded} event.
     */
    function recordConsent(string calldata consentType, string calldata metadata) external {
        // Create a new consent record
        Consent memory newConsent = Consent({
            consentingParty: msg.sender,
            consentType: consentType,
            timestamp: block.timestamp,
            metadata: metadata
        });

        // Store the consent record in the mapping
        consents[nextConsentId] = newConsent;

        // Emit an event to log the consent recording
        emit ConsentRecorded(
            nextConsentId,
            msg.sender,
            consentType,
            block.timestamp,
            metadata
        );

        // Increment the consent ID for the next record
        nextConsentId++;
    }

    /**
     * @dev Retrieves a consent record by ID.
     * @param consentId The ID of the consent record to retrieve.
     * @return consentingParty The address of the party who gave consent.
     * @return consentType The type of consent.
     * @return timestamp The block timestamp when the consent was recorded.
     * @return metadata Additional information related to the consent.
     */
    function getConsent(uint256 consentId) external view returns (address, string memory, uint256, string memory) {
        Consent memory consent = consents[consentId];
        return (consent.consentingParty, consent.consentType, consent.timestamp, consent.metadata);
    }
}
