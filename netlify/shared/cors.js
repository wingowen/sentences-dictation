// Shared CORS utilities for Netlify functions
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

// Handle CORS preflight requests
const handleCorsPreflight = (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: '',
    };
  }
  return null;
};

// Validate HTTP method
const validateHttpMethod = (event, allowedMethods) => {
  if (!allowedMethods.includes(event.httpMethod)) {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: 'Method not allowed',
        message: `This endpoint only accepts: ${allowedMethods.join(', ')}`,
      }),
    };
  }
  return null;
};

export { CORS_HEADERS, handleCorsPreflight, validateHttpMethod };