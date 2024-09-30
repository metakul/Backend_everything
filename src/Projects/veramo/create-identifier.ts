import { IdentifierErrorEnum } from '../../DataTypes/enums/Error.js';
import { logWithMessageAndStep } from '../../Helpers/Logger/logger.js';
import { agent } from './setup.js'

export async function createIdentifier(_alias : string,childLogger:any) {
  try {
    logWithMessageAndStep(childLogger, "Create Identifier step", "Creating Identifier", "createIdentifier", JSON.stringify(_alias),"debug");

    const identifier = await agent.didManagerCreate({ alias: _alias })
    logWithMessageAndStep(childLogger, "Create Identifier step", "New identifier created", "createIdentifier", JSON.stringify(identifier),"debug");
    console.log(JSON.stringify(identifier, null, 2))
    return identifier;
    
  } catch (error) {
    logWithMessageAndStep(childLogger, "Create Identifier error step", "Error Creating Identifier", "createIdentifier", JSON.stringify(error),"error");
    throw IdentifierErrorEnum.createIdentifierError(error) ;
    
  }
}



