/**
 * Mirrors the AuthorizationError thrown by the original DAL functions.
 * Caught by AuthorizationExceptionFilter → 403 JSON response.
 */
export class AuthorizationError extends Error {
  constructor(
    message = 'You do not have permission to perform this action',
  ) {
    super(message);
    this.name = 'AuthorizationError';
    // Needed for instanceof checks to work in transpiled ES5 targets
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}