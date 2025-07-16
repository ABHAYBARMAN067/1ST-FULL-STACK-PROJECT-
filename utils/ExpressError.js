class ExpressError extends Error {
  constructor(statusCode, message) {
    super(message); // pass the message to parent Error class
    this.statusCode = statusCode;
  }
}

module.exports = ExpressError;
