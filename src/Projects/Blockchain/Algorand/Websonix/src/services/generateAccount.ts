// src/services/algorand.ts
import algosdk from 'algosdk';

export const createAlgorandAccount = () => {
  try {
    const generatedAccount = algosdk.generateAccount();
    const passphrase = algosdk.secretKeyToMnemonic(generatedAccount.sk);
    
    console.log(`My address: ${generatedAccount.addr}`);
    console.log(`My passphrase: ${passphrase}`);
    
    return {
      address: `${generatedAccount.addr}`,
      privateKey: generatedAccount.sk,
      passphrase,
    };
  } catch (error) {
    console.error('Error generating Algorand account', error);
    throw new Error('Account generation failed');
  }
};