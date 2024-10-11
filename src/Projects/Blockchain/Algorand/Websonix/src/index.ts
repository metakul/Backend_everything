import { sendPaymentTransaction, createAsset } from './services/transaction';
import { createAlgodClient } from './services/algodClient';
import { checkBalance } from './services/checkBalance';
import mockData from "./mockData/mockData";
import { fromAccount, toAccount } from './mockData/accountDetails'; // Import saved accounts
const algodClient = createAlgodClient();

console.log('Algorand Client created:', algodClient);

// Check the balances of both accounts
checkBalance(fromAccount.address);
checkBalance(toAccount.address);

// Destructure mock data for easier usage
const { amount, note, assetDetails } = mockData;

// Call sendPaymentTransaction function with the imported accounts
const sendPayment = async () => {
  try {
    const paymentResult = await sendPaymentTransaction(
      {
        addr: fromAccount.address,
        privateKey: fromAccount.privateKey,
      },
      toAccount.address,  // Use the second account address for receiving
      amount,
      note
    );
    console.log('Payment transaction successful:', paymentResult);
    return true
  } catch (error) {
    console.error('Payment transaction failed:', error);
  }
};

// Call createAsset function with the imported accounts
const createNewAsset = async () => {
  try {
    const assetResult = await createAsset(algodClient, {
      addr: fromAccount.address,
      privateKey: fromAccount.privateKey,
    }, assetDetails);
    console.log('Asset creation successful:', assetResult);
  } catch (error) {
    console.error('Asset creation failed:', error);
  }
};

// Execute the functions
sendPayment().then((data)=>{

  createNewAsset();
});
