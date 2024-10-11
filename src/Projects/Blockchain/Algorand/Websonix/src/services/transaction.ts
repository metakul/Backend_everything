import algosdk from 'algosdk';
import { AlgodClient } from 'algosdk/dist/types/client/v2/algod/algod';
import { createAlgodClient } from './algodClient';

// Function to send a payment transaction
export const sendPaymentTransaction = async (fromAccount: { addr: any; privateKey: Uint8Array }, toAccountAddress: string, amount: number, note: string) => {

    const algodClient = createAlgodClient();
    try {
        const suggestedParams = await algodClient.getTransactionParams().do();
        const ptxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
            sender: fromAccount.addr,
            suggestedParams,
            receiver: toAccountAddress,
            amount,
            note: new Uint8Array(Buffer.from(note)),
        });

        const signedTxn = ptxn.signTxn(fromAccount.privateKey);
        const data = await algodClient.sendRawTransaction(signedTxn).do();
        const result = await algosdk.waitForConfirmation(algodClient, data.txid, 4);

        console.log(data);
        
        const transactionDetails = {
            data,
            txn: result.txn,
            decodedNote: Buffer.from(result.txn.txn.note).toString(),
        };

        return transactionDetails;

    } catch (error) {
        console.error('Error sending payment transaction:', error);
        throw new Error('Transaction failed');
    }
};

// Function to create an asset
export const createAsset = async (algodClient:any, creatorAccount: { addr: string; privateKey: Uint8Array }, assetDetails: {
    total: number,
    decimals: number,
    assetName: string,
    unitName: string,
    assetURL: string,
    defaultFrozen?: boolean,
    manager?: string,
    reserve?: string,
    freeze?: string,
    clawback?: string,
}) => {
    try {
        const suggestedParams = await algodClient.getTransactionParams().do();
        
        const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
            sender: creatorAccount.addr,
            suggestedParams,
            total: assetDetails.total,
            decimals: assetDetails.decimals,
            assetName: assetDetails.assetName,
            unitName: assetDetails.unitName,
            manager: assetDetails.manager || creatorAccount.addr,
            reserve: assetDetails.reserve || creatorAccount.addr,
            freeze: assetDetails.freeze || creatorAccount.addr,
            clawback: assetDetails.clawback || creatorAccount.addr,
            assetURL: assetDetails.assetURL,
            defaultFrozen: assetDetails.defaultFrozen || false,
        });

        const signedTxn = txn.signTxn(creatorAccount.privateKey);
        
        const trx = await algodClient.sendRawTransaction(signedTxn).do();
       console.log("trx",trx);
       
        const result = await algosdk.waitForConfirmation(algodClient, txn.txID.toString(), 3);
        console.log(result);

        // Return asset creation details as JSON
        return {
            trx,
            txn: result,
        };

    } catch (error) {
        console.error('Error creating asset:', error);
        throw new Error('Asset creation failed');
    }
};
