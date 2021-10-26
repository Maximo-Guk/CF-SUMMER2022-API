import ValidationError from '../classes/ValidationError';

// Validate emoji reactions
export default function validateReactionType(reactionType: string): void {
  const validReactionTypes = ['😀', '😂', '😭', '🥰', '😍', '🤢'];
  if (!validReactionTypes.includes(reactionType)) {
    throw new ValidationError('This reaction is not supported', 400);
  }
}
