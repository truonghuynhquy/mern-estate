class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;

// export default AppError = (message, statusCode) => {
//   const error = new Error();
//   error.statusCode = statusCode;
//   error.message = message;
//   return error;
// };
