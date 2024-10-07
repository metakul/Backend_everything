


export function transformPropertyResult(retrievedProperty:any) {
    return {
        location: retrievedProperty[1],
        uniquePropertyId: retrievedProperty[2],
        claimantsPublicKey: retrievedProperty[3],
        encumbranceIds: retrievedProperty[4],
        propertyownerInfo: retrievedProperty[0].map((owner: any[]) => ({
            executantPublicKey: owner[0],
            aadhaarHash: owner[1],
            uniquePropertyCardIds: owner[2],
            isApprovedForPOA: owner[3],
            POAAddress: owner[4],
        }))
    };
}
