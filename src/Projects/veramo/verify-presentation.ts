import { IdentifierErrorEnum } from "../../DataTypes/enums/Error";
import { agent } from './setup.js';

/**
 * Verifies a presentation
 * @param presentation The presentation to verify
 * @returns The result of the verification
 */
export async function verifyPresentation(presentation: unknown) {
  try {
    const verifiablePresentationResult = await agent.verifyPresentationEIP712({
      presentation: presentation
    })

    return verifiablePresentationResult
  } catch (error) {
    console.log(error)
    throw IdentifierErrorEnum.verifyPresentationError(error);
  }
}
