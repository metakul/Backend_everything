// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.2;

/**
 * @title DataTypes
 * @dev Store Data types for Kaveri App
 */

library DataTypes {
    enum Stakeholders {
        INSTITUTION,
        COURTS,
        BANKS,
        PRIVATE_TRUST
    }
    enum PropertyCard {
        Individual,
        Institution
    }

    // todo changes executantPublicKey to hold all details of Executant struct
    struct PropertyDetails {
        PropertyownerInfo[] propertyownerInfo;
        string location;
        bytes32 uniquePropertyId;
        address[] claimantsPublicKey;
        bytes32[] encumbranceIds;
        // todo add deedDocuments
    }

    struct PropertyownerInfo{
        address executantPublicKey;
        string aadhaarHash;
        bytes32 uniquePropertyCardIds;
        bool isApprovedForPOA;
        address POAAddress;
    }

    struct PropertyRegistrationConsent {
        PropertyownerInfo propertyownerInfo;
        bytes32 executantSignedDataHash;
        bytes executantSignature;
        uint256 _nonce;
    }

    enum SaleDeedType {
        REGISTER,
        SALE_DEED,
        GIFT_DEED,
        CANCELLATION_DEED,
        RECTIFICATION_DEED
    }


    // Structure to define an encumbrance
    struct EncumbranceDetails {
        string encumbranceType;
        string encumbranceHolderPublicKey;
        uint256 encumbranceTimePeriod;
        bool exists;
    }

    struct PropertyRegistration {
        bytes32 uniquePropertyId; // blank if new property
        PropertyRegistrationConsent[] ownerConsent; // blank for new registration
        address[] claimantsPublicKey;
        bytes32 requestId;
        DataTypes.SaleDeedType saleDeedType;
        bytes32 associatedPropertyId;
        bytes32 signedDataPacket;
        bytes sroSignature;
        uint256 _nonce;
    }


    struct EKYC {
        string name;
        string dob;
        string gender;
        bytes32 aadhaarHash;
        string addressInfo;
        string contactInfo;
        bytes32 proof;
    }
 
    // struct PropertyCard {
    //     SecuredZone securedZone;
    //     NonSecuredZone nonSecuredZone;
    // }
    // Annexure 2: Structure of the property data stored in the Blockchain

    struct Owner {
        string name;
        string dob;
        string gender;
        string addressInfo;
        string govtIdentityProof;
        bytes32 aadhaarHash;
        string nearestRelationship;
        string relativeName;
        bool representedByPOA;
        bool representedByMinorGuardian;
        string poaOrGuardianName;
        uint256 poaOrGuardianAge;
        string uniquePOAIdentifier;
        string minorGuardianRelationship;
        bool institutionOrIndividual;
        string institutionName;
        string institutionAddress;
    }

    struct PropertyIdentification {
        uint256 currentPropertyNumberTypeID;
        string currentPropertyNumberType;
        string currentPropertyNumber;
        uint256 previousPropertyNumberTypeID;
        string previousPropertyNumberType;
        string previousPropertyNumber;
    }

    struct Encumbrance {
        string encumbranceType;
        string encumbranceHolderPublicKey;
        uint256 encumbranceTimePeriod;
    }

    struct Property {
        bytes32 uniquePropertyCardId; // Hash pointer
        string registrationNumber;
        Owner[] owners; // Array of owners
        string revenueDistrict;
        string registrationDistrict;
        string sroCode;
        string sroName;
        string regionType; // BBMP/ULB/Gram Panchayat/Bhoomi
        string propertyType; // Khatha/Form 9 & Form 11/RTC
        string referenceNumber; // Khatha/Form 9 & Form 11/RTC Reference Number
        string propertyDescription;
        string natureOfProperty; // Non-Agriculture/Agriculture/Residential/Commercial
        string kaveriVillageCode;
        string kaveriVillageName;
        string regionDB2VillageCode;
        string regionDBDistrictCode;
        string regionDBTalukaCode;
        string regionDBHobliCode;
        PropertyIdentification[] propertyIdentifications; // Array for multiple identifications
        string scheduleType;
        string unitID; // Sq. Mt. / Sq. Ft. / Hectare / Acre
        string areaName;
        string boundaryEast;
        string boundaryWest;
        string boundaryNorth;
        string boundarySouth;
        uint256 totalExtentArea;
        uint256 eastToWestDimension;
        uint256 northToSouthDimension;
        uint256 considerationAmount;
        uint256 paidStampDuty;
        uint256 paidRegistrationFee;
        uint256 paidOtherFee;
        uint256 additionalDuty;
        uint256 cessDuty;
        uint256 governmentDuty;
        bool isExempted;
        string deedDocument; // in Hexadecimal
        string[] publicKeys; // Public keys (for joint owners)
        Encumbrance[] encumbrances;
        string subRegistrarName;
        string subRegistrarDigitalSignature;
        bytes32 previousRecordHash; // Hash pointer to previous record
    }

    // Power of Attorney (POA) data stored in the Blockchain
    struct Executant {
        string name;
        string dob; // Date of Birth & Age
        string gender;
        string nationality;
        string maritalStatus;
        string profession;
        string addressInfo;
        string govtIdentityProof;
        bytes32 aadhaarHash;
        string nearestRelationship; // S/O, D/O, W/O, C/O
        string relativeName;
        string relativeMobile;
        string relativePAN;
        string relativeEmail;
        string[] publicKeys; // Array of public keys for executants
        Institution institution; // Institution details, if applicable
    }

    struct Claimant {
        string name;
        string dob; // Date of Birth & Age
        string gender;
        string nationality;
        string maritalStatus;
        string profession;
        string addressInfo;
        string govtIdentityProof;
        bytes32 aadhaarHash;
        string nearestRelationship; // S/O, D/O, W/O, C/O
        string relativeName;
        string relativeMobile;
        string relativePAN;
        string relativeEmail;
        string publicKey; // Public key of claimant
    }

    struct POA {
        bytes32 uniquePOAIdentifier;
        bytes32 propertyIdentifier; // Reference to the Property Identifier (Hash Pointer)
        Executant[] executants; // Array of executants
        Claimant claimant; // POA holder (Claimant)
        uint256 considerationAmount;
        bool poaActive; // POA Active (Y/N)
        string deedDocument; // Deed Document in Hexadecimal
        string sroName;
        string sroDigitalSignature; // SRO Digital Signature
    }

    // Annexure 8: Data Recorded Against the Card in Blockchain

    struct CardHolder {
        string name;
        string dob; // Date of Birth & Age
        string gender;
        string nationality;
        string maritalStatus;
        string profession;
        string addressInfo;
        string govtIdentityProof;
        bytes32 aadhaarHash;
        string nearestRelationship; // S/O, D/O, W/O, C/O
        string relativeName;
        string relativeMobile;
        string relativePAN;
        string relativeEmail;
    }

    struct Institution {
        bool isInstitution; // Institution/Individual Flag (True for Institution)
        string legalName;
        string legalAddress;
        string parentCompany; // Institution’s Parent Holding Company, if any
        string identifier; // Institution’s PAN/TAN/GST Identification
        string gstOrPanOrTan; // Institution’s PAN/TAN/GST, if any
    }

    struct Card {
        string cardNumber;
        string publicKey;
        CardHolder holderDetails;
        Institution institutionDetails;
    }
}
