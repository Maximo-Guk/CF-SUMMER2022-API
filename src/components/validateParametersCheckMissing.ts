import ValidationError from '../classes/ValidationError';
import validateParameters from './validateParameters';

export default function validateParametersCheckMissing(
  inputValidParams: string[],
  queryParameters: string[],
): void {
  // Verify if request is missing any parameters
  let missingParameters = '';
  const validQueryParameters = inputValidParams;
  validQueryParameters.forEach((parameter) => {
    if (queryParameters.indexOf(parameter) === -1) {
      // If there is already a missing parameter
      if (missingParameters) {
        missingParameters = missingParameters + ', ' + parameter;
      } else {
        missingParameters = parameter;
      }
    }
  });
  if (missingParameters) {
    throw new ValidationError(
      'Missing the following parameter(s): ' + missingParameters + '.',
      400,
    );
  }
  // Verify if request has any invalid parameters
  validateParameters(inputValidParams, queryParameters);
}
