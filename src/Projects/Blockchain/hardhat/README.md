## Kaveri Contracts




## Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Deployment.ts
```

Deployment
```shell
npx hardhat ignition deploy ./ignition/modules/Deployment.ts --network amoy
npx hardhat ignition deploy ./ignition/modules/Deployment.ts --network arbitrum
```



## Key points to add
- [x] Init Hardhat Contract
- [ ] Only a buyer of a property(whose identity have been authenticated and verified) should be able to sell the property
- [ ]  If one stakeholder refuses to validate a transaction, the transaction should fail and without the consent of all stakeholders no record of any transaction could be tampered/mutilated. 
- [ ] Special Institutional Stakeholders(can also perform transactions):
     - [ ]Institutions
     - [ ]Courts
     - [ ]Banks
     - [ ]Private Trust
- [ ] Consent of the buyer/seller should be recorded prior to any transactions.
- [ ] Flagging a transaction which does not have consent by both parties

## Property Cards [only issued at sub-registrar’s office.]


  As In ([3.1.1] Encoding of PPK and Mapping of Individual Profile to Property Cards)[Should hold ]
- [x] Production of property cards + -[x] Institutional property cards.
- [ ] Mapping of Individual profile to property cards
- [x] Mapping of property to the property cards 
- [x] Property identifiers (1 or more) for each card. 
- [ ] For Instituion Card: institution name, address, authority and person.  - [ ] Change the person representing from time to time,only for institutional cards.


Note::Mapping of property details can be done only in the SRO office.

## Verification of Property Cards 
- [ ] Function to verify propertycard  as soon as card is readed after E_KYC and send the proof of verified card to DEO at registrar office.
- [ ] The encrypted text and successfully verified Aadhaar number as a hash, along with the unique hash property identifier that is mapped with the card will be converted into a data packet, which will thereafter be signed with the DSC of the desktop application and then sent to the Blockchain system.
- [ ] For multi Owner Data packet will have combined details of all joint owner.

#### Contract SIDE:: [Clause 3.2]
- [ ] Verify the signature (via data packet received) via DEO in sub registrar's office
- [ ] Fetch Property record from blockchaain (property identifier in data packet)
- [ ] For the property record, use the associated public key in the Blockchain to decrypt the encrypted text. If the decryption is successful, then match the decrypted Aadhaar e-KYC details with the one that is stored associated with the property record.
- [ ] Above should update mapping of ownership and each public key should have successfully decrypted at least one encrypted text that was part of the data packet


## Registration Process  [3.3]
- [ ] Create a consent recording process over Blockchain, without it the Kaveri System sahll not proceed with registration. 
- [ ] Using property's current number and prevoius number, restricted to Kaveri village code. It will locate the trx assocaited with property and get latest tx to check if property Id is associated with it.(Get HELP)
- [ ] In case there is blockchain property Id , verify the last trx details with executant and pass property Id to blockchain with e-KYC and index II data

- [ ] If empty or no trx, then pass empty value against property id with e-KYC and index II data.

- [ ] If Property Id is receives as part of the communications from Kaveri, then it shall use the same to fetch the record from Blockchain and drive the validation process of users.

After 1st step:
- [ ] Receive the details(request) of executants and claimants,(either and individual or institution) (with unique request identifier, type of sale deed).
- [ ] if empty value take the value in current and previous number to perform a local search over blockchain(to check if any property matching these record exist)

- [ ] If record exist notify sub-registrar who can accept or reject the assertion from blockchain.

- [ ] After verifying the property wrt to property identifier verify the users ekyc(only after complete setup of property and consent in blockchain)

- [ ] Digitally signed the property index data via property card.

- [ ] If not new property entry request, validation of signed index data by sending via executant data  and his kyc.(decrypt via signature to verify the signed data)(Now able to transact on the property).Also match the Aadhar number as part of e-kyc with the aadhar no of property owner.

- [ ] In case the request has multiple properties in the same deed registration transaction, then this check will be done for each of the properties, in order to ascertain whether the executant/s is possessor of all properties. A new property entry request will not require any such verification,

- [ ] Read Public keys of claimants

- [ ] Create a data packet with all data created in above (aadar e-kyc details, public key of claimants and digitally signed property index data ) and keep it stored in non-volatile memory for further uses.(map unique request identifier and the property identifier, holding the signed and verified data packet by executant)

- [ ] Confirmation of verification status to the registrar to have a list of signed deeds + new deed

- [ ] Process list of signed deeds (document) for registration.(A unique document number is created or unique request identifier as mentioned in the above 2 steps).

- [ ] The document (printed) is added to book 1. (Lets say a ledger to hold all douments history) along with imprints of photogrpahs and signature.

- [ ] Original document is signed by sub-registar and then is scanned and recorded.

- [ ] Sub-registar will pass unique property identifier, scanned docs from above to blockahin request, which shall 
    - [ ] Append the Data received from Kaveri application to the data packet of signed deeds (match via property identifier).
    - [ ] Get the appended data packet, e-signed by sub-registar and send dPacket to specific smart contract to perform necessary check for request(having request identifier) and append the reqeust into blockchain ledger.

##### Signed request from registar
After receiving the the data packet sent via registrar, smart contract should:

- [ ] Verify the SRO's signature over data packet
- [ ] List weather the request is new property (along with registration) or a simple registration of a document for an existing property in the blockchain.(if new property entry skip below part)
     #### For existing property request
     - [ ] Fetch the property record via unique identifier inside data packet which is currently undergoing change of ownership on account of registration request.
     - [ ] Verify the data packet if it is signed by owner at SRO level. If verified then executant has establisehd rights for property transaction.
     - [ ] After successfull match (verify) append the new record.(Check claimants public key for existence and correctness).
     - [ ] If Public key is found, then match the   associated identity data  + the aadhaar e-kyc fetched from data packet of the request (signed by claimants)
     - [ ] If sale Deed (parameter passed by kaveri) after aggrement of sale. Pull out the public key of property and match the public key(s) of the claimant(s) of trx. Alsp match the executants public key who recorded the trx with the public key of the registration request. proceed only if matched. [Demographic match + match in above step]

     - [ ] Append the new record data into the ledger

     - [ ] Fetch the old record of property and points (use hash pointer) the new record with old property record.

     - [ ] Remove the public key stored against attribut xl of property and append it to new record.

     - [ ] The owner data is in new ledger entry updated with claimants details.

    #### For new property
     - [ ]  A property entry is done in the property ledger by updating the Sub attributes (ix), (x), (xi), (xii) and (xiii) of attribute (iii) of annexure 2 along with the newly received property details. (via property Data inside registration data)(it contains the public key of claimant's' in owner section)

     - [ ] Append the new record into the ledger




- [ ] There will be cases where more than one property will be registered through a single deed transaction, in which case the executant(s) and the claimant(s) will remain the same. Under such circumstances, <PropertyDetails> tag will have more than one property mentioned. For each such property in the <PropertyDetails> tag, a separate Blockchain property entry will be created with a different Blockchain Property ID in each entry. All these entries though will have same executant(s) and claimant(s).(take HELP)

- [ ] A success message is sent to the Kaveri system containing the unique Blockchain property identifier (Parameters), upon Kaveri requesting the same by clicking the status button at is end. This process leads to recording of the success message (Integration) to complete the registration process.


## Registration of Sale Deed
### Registration Involving Institution
- [ ] In case of executant, the flag sub-attribute (xxi) of attribute (ii) of annexure 2, will be set to individual or institution based upon the case
    #### changes for Institution
    - [ ] Case:Executant= individual representing institution will have to do AAdhar auth and e-kyc. 
    Data created[ owner section (annexure 2, attribute (iii)) but will not be used for matching and verification.(no Aadhaar match)]. But aadhar and other details will be updated on new blockchain entry((annexure 2, attribute (iii))).
    - [ ] Case:Claimant= No match in contract. Update owner section.

Note: If institution is bank, court (they wont be owner) Public key and digital sign wont be verified.

### Registration Process for properties that undergo part sale 
- [ ] For each sale, new property number (in the case Bhoomi a temprory no).Reported by executant.
- [ ] Index II data , also share property schedule details(area under - <Property Schedule Details> <Total Area> )
- [ ] Locate property via property Id (Total area in provided in req should be lower to make sure its sale of a part of land)
- [ ] Create child of land(mother-child policy) [two child trx]
- [ ] In case the Blockchain Property Id is empty then Kaveri shall send an empty value to Blockchain. Upon receiving such a value, Blockchain will ascertain whether the property is a new entry or an existing entry in Blockchain by performing steps mentioned in the previous section. Subsequently, it will either inform the existing property details to the sub-registrar and map the same with the new request or create a new entry of the property in the Blockchain.

### 3.3.1.3 Registration Process for rectification deeds
- [ ] executant/s would be those who were the owner/s as per the previous transaction, a transaction before the current one

## Total Types of users(Hierarchy):

Sub-registrar's (DEO)
Institutions
Buyer/Seller (Executant/Claimants)


## Extras
- [ ] Function to send proof and verify the propertry identifier stored in databse if it is mapped with property card.
- [ ] At registration when proeprty is mapped in smart contract, the unique identifier generated for a given proeprty in blockchain has also to bed recorded against the property in Kaveri old database.
- [ ]  Develop a function to verify a digital signature by extracting the public key and validating the signed data using the provided proof.
- [ ] Create Transient storage so that a trx data can be cleared out after the trx.
- [ ] When we use web3.js or ethers.js to listen for or retrieve events, the indexed parameters are stored in the topics section of the log, while the non-indexed parameters are stored in the data section.