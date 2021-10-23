import ValidationError from '../classes/ValidationError';
import { Request } from 'itty-router';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function validateJson(request: Request): Promise<any> {
  if (request.json === undefined) {
    throw new ValidationError('Please include a valid json request body', 400);
  }

  try {
    return await request.json();
  } catch (error) {
    throw new ValidationError('Please include a valid json request body', 400);
  }
}
