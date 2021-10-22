import { version as uuidVersion, validate as uuidValidate } from 'uuid';

// Validate uuid
export default function uuidValidateV1(uuid: string): boolean {
  return uuidValidate(uuid) && uuidVersion(uuid) === 1;
}
