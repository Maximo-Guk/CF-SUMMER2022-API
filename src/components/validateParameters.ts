import ValidationError from '../classes/ValidationError';

// Validate parameters by specifying an array of valid params
// and checking them with user's parameters
export default function validateParameters(
  inputValidParams: string[],
  queryParameters: string[],
): void {
  // Verify if request has any invalid parameters
  let invalidParameters = '';
  const validQueryParameters = inputValidParams;

  // Iterate through each query "key" in the body.
  queryParameters.forEach((parameter) => {
    if (validQueryParameters.indexOf(parameter) === -1) {
      // If there is already an invalid parameter
      if (invalidParameters) {
        invalidParameters = invalidParameters + ', ' + parameter;
      } else {
        invalidParameters = 'The following parameter(s) are invalid: ' + parameter;
      }
    }
  });
  if (invalidParameters) {
    throw new ValidationError(invalidParameters + '.', 400);
  }
}
