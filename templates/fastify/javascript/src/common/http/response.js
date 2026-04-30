function successResponse(message, data = {}) {
  return {
    success: true,
    message,
    ...data
  };
}

function errorResponse(message, details) {
  return {
    success: false,
    message,
    ...(details ? { details } : {})
  };
}

module.exports = { successResponse, errorResponse };
