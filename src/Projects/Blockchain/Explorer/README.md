# Blockchain SDK

Blockchain SDK is a Node.js SDK for interacting with blockchain networks using ethers.js. It provides a simple API for retrieving blocks, transactions, network statistics, and sending private transactions. This SDK is designed to work with customizable provider URLs, enabling flexible interactions with various blockchain nodes.

## Installation

Install the package using npm:

`npm install blockchain-sdk`

## Usage
### Importing the SDK

To use the SDK, import it into your project:

```
import meta_explorer from 'meta-explorer';
const { BlockchainSDK } = meta_explorer;
```

### Initializing the SDK

Initialize the SDK with a provider URL and specify the provider type (e.g., 'ethers'):

`const blockchainSDK = new BlockchainSDK(providerUrl, 'ethers');`

### API

The SDK provides several methods to interact with the blockchain network.
### Methods

#### getBlock(blockNumber: string | number)

Retrieves a block by its number or the string 'latest'.

`const block = await blockchainSDK.getBlock('latest');`

#### getTransaction(txHash: string)

Fetches transaction details by its hash.

`const transaction = await blockchainSDK.getTransaction('0xTransactionHash');`

#### sendPrivateTransaction(from: string, to: string, value: string, gas: string, options: object)

Sends a private transaction to a specified address with optional privacy options.

`const receipt = await blockchainSDK.sendPrivateTransaction(from, to, value, gas, { privateFor, privacyFlag });`

#### getAddressDetails(address: string)

Fetches balance and transaction details for a specific address.

`const details = await blockchainSDK.getAddressDetails('0xAddress');`

#### getNetworkStats()

Retrieves network statistics, such as the current block number and other metrics.

`const networkStats = await blockchainSDK.getNetworkStats();`

## Example Usage

Here’s a basic example of using the SDK to retrieve the latest block, fetch transactions within a block, and send a private transaction:

```
import BlockchainSDK from 'blockchain-sdk';

const providerUrl = 'https://your.provider.url';
const blockchainSDK = new BlockchainSDK(providerUrl, 'ethers');

async function main() {
    // Retrieve the latest block
    const latestBlock = await blockchainSDK.getBlock('latest');
    console.log('Latest Block:', latestBlock);

    // Fetch a transaction by its hash
    const txHash = '0xTransactionHash';
    const transaction = await blockchainSDK.getTransaction(txHash);
    console.log('Transaction:', transaction);

    // Send a private transaction
    const receipt = await blockchainSDK.sendPrivateTransaction(
        '0xSenderAddress',
        '0xRecipientAddress',
        '0.1',  // Value in ETH
        '21000',  // Gas limit
        { privateFor: '0xPrivateForAddress', privacyFlag: 3 }
    );
    console.log('Private Transaction Receipt:', receipt);
}

main().catch(console.error);
```
## Error Handling

The SDK throws custom errors defined in the BlockchainError enum. Handle these errors using try-catch blocks:

```
try {
    const block = await blockchainSDK.getBlock('latest');
} catch (error) {
    console.error('Error retrieving block:', error);
}
```

## License

This project is licensed under the C3I License.