/**
 * Utility helper to send consistent JSON responses across all API endpoints.
 */

const sendSuccess = (res, { data = null, message = 'Operation successful', statusCode = 200, pagination = null } = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(pagination && { pagination }),
  });
};

const sendError = (res, { message = 'An error occurred', statusCode = 500, errors = null } = {}) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
};

module.exports = {
  sendSuccess,
  sendError,
};
