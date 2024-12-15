import * as OracleSdk from 'meta-oracle';
import { ethGetBlockByNumber } from './adapters';
import { createMnemonicRpc } from './rpc-factories';

async function main() {
    const gasPrice = 10n ** 9n;
    const rpc = await createMnemonicRpc('http://localhost:1237', gasPrice);
    const rpcSignerAddress = await rpc.addressProvider();

    // Uncomment and use the getProof method if needed
    // const proof = await OracleSdk.getProof(rpc.getStorageAt, rpc.getProof, ethGetBlockByNumber.bind(undefined, rpc), uniswapExchange.address, token0.address, blockNumber);

    // Ask the SDK for a price estimate as of the latest block, which should match what the SDK said (since it executed in the latest block)
    const sdkPrice = await OracleSdk.getPrice(rpc.getStorageAt, ethGetBlockByNumber.bind(undefined, rpc), "uniswapExchange.address", "token0.address", "latest");
    console.log(`SDK Price: ${Number(sdkPrice) / 2 ** 112}`);
}

main().catch(console.error);