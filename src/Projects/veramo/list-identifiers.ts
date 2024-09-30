import { IIdentifier } from '@veramo/core';
import { agent } from './setup.js'
import { IdentifierErrorEnum } from '../../DataTypes/enums/Error.js';

export async function listIdentifiers() {
  try {
  const identifiers = await agent.didManagerFind()

  console.log(`There are ${identifiers.length} identifiers`)
  const ids: IIdentifier[] = [];
  if (identifiers.length > 0) {
    identifiers.map((id) => {
      
      ids.push(id)
    })
    return ids;
  }
} catch (error) {
  console.log(error)
  throw IdentifierErrorEnum.listIdentifierError(error);
}
}