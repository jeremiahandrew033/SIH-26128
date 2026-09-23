/**
 * Netlify Function: API Proxy
 * Forwards requests to the backend API and handles CORS
 */

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:8000';

exports.handler = async (event, context) => {
  // Only allow POST, GET, PUT, DELETE
  if (!['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(event.httpMethod)) {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }

  // Extract the API path
  const path = event.path.replace('/.netlify/functions/api/', '');
  const url = `${API_BASE_URL}/${path}`;
  
  try {
    const response = await fetch(url, {
      method: event.httpMethod,
      headers: {
        'Content-Type': 'application/json',
        ...event.headers,
      },
      body: event.body ? event.body : undefined,
    });

    const body = await response.text();

    return {
      statusCode: response.status,
      body: body,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
      },
    };
  } catch (error) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: 'Backend service unavailable', details: String(error) }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    };
  }
};
