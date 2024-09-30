import { IdentifierErrorEnum } from "../../DataTypes/enums/Error";
import { agent } from './setup.js';



export async function createCredential(alias = 'default') {
try {
  

  const verifiableCredential = await agent.createVerifiableCredential({
    credential: {
      issuer: { id: 'did:ethr:0x0295d33e76b5c72f29aae4c092f192a9e23f0b93b3aa8e0a2ebdec6ef2a99e727e' },
      credentialSubject: {
        id: 'did:ethr:0x0295d33e76b5c72f29aae4c092f192a9e23f0b93b3aa8e0a2ebdec6ef2a99e727e',
        partName: 'Engine',
        manufacturer: 'HAL India',
        procuredOn: '2021-01-01',
        serialNumber: '123456',
        timestamp: '2021-01-01',
      },
    },
    proofFormat: 'jwt',
  })
  
    return verifiableCredential
  } catch (error) {
    throw IdentifierErrorEnum.createCredentialError(error) ;
  }

}




