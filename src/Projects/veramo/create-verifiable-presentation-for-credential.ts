import { agent } from './setup.js';
import { IdentifierErrorEnum } from '../../DataTypes/enums/Error.js';
import { W3CVerifiableCredential, VerifiableCredential } from '@veramo/core';

// Type guard to check if the credential is a VerifiableCredential
function isVerifiableCredential(credential: W3CVerifiableCredential): credential is VerifiableCredential {
  return (credential as VerifiableCredential).issuer !== undefined;
}

export async function createVerifiablePresentation(credential: W3CVerifiableCredential) {
  try {
    // Use the type guard to determine the holder ID
    const holderId = isVerifiableCredential(credential)
      ? typeof credential.issuer === 'string'
        ? credential.issuer
        : credential.issuer.id
      : undefined;

    if (!holderId) {
      throw IdentifierErrorEnum.credInfoError(credential);
    }

    const verifiablePresentation = await agent.createVerifiablePresentation({
      presentation: {
        holder: holderId,
        '@context': ['https://www.w3.org/2018/credentials/v1', 'https://example.com/1/2/3'],
        type: ['VerifiablePresentation', 'Custom'],
        issuanceDate: new Date().toISOString(),
        verifiableCredential: [credential], // make this abc dynamic such that it can be taken from user via api
      },
      proofFormat: 'EthereumEip712Signature2021',
    });
    return verifiablePresentation;
  } catch (error) {
    throw IdentifierErrorEnum.createVerifiablePresentationError(error);
  }
}
