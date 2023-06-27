/**
 * Custom class for validation error
 */
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
    this.name = 'ValidationError';
  }
}

export default ValidationError;
