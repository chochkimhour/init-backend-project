function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json"
  });
  res.end(JSON.stringify(payload));
}

function successResponse(res, message, data = {}, statusCode = 200) {
  return sendJson(res, statusCode, {
    success: true,
    message,
    ...data
  });
}

function errorResponse(res, message, statusCode = 500, details) {
  return sendJson(res, statusCode, {
    success: false,
    message,
    ...(details ? { details } : {})
  });
}

module.exports = { successResponse, errorResponse };
