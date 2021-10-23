import ValidationError from '../classes/ValidationError';

export default function verifyPhotoUpload(photoBase64Encoded: string): void {
  try {
    const splitBase64 = photoBase64Encoded.split(';base64,');
    if (
      photoBase64Encoded.startsWith('data:image/png;base64,') ||
      photoBase64Encoded.startsWith('data:image/jpeg;base64,') ||
      photoBase64Encoded.startsWith('data:image/gif;base64,')
    ) {
      if (atob(btoa(splitBase64[1])) !== splitBase64[1]) {
        throw new ValidationError('Invalid photo', 400);
      }
    } else {
      throw new ValidationError('Invalid photo', 400);
    }
  } catch (error) {
    throw new ValidationError('Invalid photo', 400);
  }
}
