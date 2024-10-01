import { IdentifierErrorEnum } from "../../DataTypes/enums/Error.js";
import { agent } from './setup.js';




//did:ethr:goerli:0x03817ae81226fc0d2a5d18cfa7ec3c97b102fce97f411ae56c40a632b150b36388
export async function createSDR(claimType: string, issuerDID :string) {
    try {
        const sdrReq = await agent.createSelectiveDisclosureRequest({
            data: {
                issuer: issuerDID,
                tag: 'sdr-req',
                claims: [{
                    reason: 'for verification',
                    claimType: claimType,
                    essential: true,
                }],
            },
        });
        console.log('SDR Request ==> :', sdrReq);
        return sdrReq;          
    } catch (error) {
        console.error('Error creating SDR:', error);
        throw IdentifierErrorEnum.createSDRError(error)
    }
}




export async function getVerifiableCredentialForSDR(claimType: string) {
    try {
        const credentials = await agent.getVerifiableCredentialsForSdr({
            sdr: {
                claims: [
                    {
                        claimType: claimType,
                        issuers: [],
                      },
                ]
            }
        });
        console.log('credentials related to claim type  :', JSON.stringify(credentials));
        return credentials;
    }
    catch (error) {
        console.error('Error fetching credentials:', error);
        throw IdentifierErrorEnum.getVerifiableCredentialForSDRError(error)
    }
}



