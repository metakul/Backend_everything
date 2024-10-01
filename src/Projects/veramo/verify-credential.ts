import { W3CVerifiableCredential } from '@veramo/core'
import { IdentifierErrorEnum } from '../../DataTypes/enums/Error.js'
import { agent } from './setup.js'

export async function createSDRverifyCredential(credential : W3CVerifiableCredential ) {
  try{
  const result = await agent.verifyCredential({
    credential : credential
  })
  console.log(`Credential verified`, result.verified)
  return result.verified
} catch (error) {
  console.log(error)
  throw IdentifierErrorEnum.createSDRVerifyCredentialError(error);
}
}

