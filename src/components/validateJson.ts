import ValidationError from '../classes/ValidationError';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function validateJson(request: Request): Promise<any> {
  try {
    return await request.json();
  } catch (error) {
    throw new ValidationError('Please include a valid json request body', 400);
  }
}
