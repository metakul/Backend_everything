import { createAlgorandAccount } from './services/generateAccount';
import { createAlgodClient } from './services/algodClient';
import { checkBalance } from './services/checkBalance'; // Import the checkBalance function

// Call the function to generate the account
const accountInfo = createAlgorandAccount();
const algodClient = createAlgodClient();

console.log('Algorand Client created:', algodClient);
console.log('Generated Account:', accountInfo);

// Check the balance of the generated account
checkBalance(accountInfo.address);