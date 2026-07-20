/* Amplify Params - DO NOT EDIT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

import { handleRequestInformation } from './handlers/requestInformation.js';
import { handleLikePhoto } from './handlers/likePhoto.js';
import { handleAdminPhoto } from './handlers/adminPhoto.js';

export const handler = async (event) => {
  console.log("Incoming path:", event.path);
  console.log("Incoming method:", event.httpMethod);
  try {
    const path = event.path || '';
    const method = event.httpMethod || '';

    if (path.endsWith('/contact/send-email') && method === 'POST') {
      console.log("Routing to contact submission handler");
      return await handleRequestInformation(event);
    }

    if (path.endsWith('/photos/likes') && ['GET', 'POST'].includes(method)) {
      console.log("Routing to photo like handler");
      return await handleLikePhoto(event);
    }

    if (path.endsWith('/photos/likes/count') && method === 'GET') {
      return await handleLikePhoto(event);
    }

    if (path.includes('/admin/') && ['POST', 'PUT', 'DELETE', 'OPTIONS'].includes(method)) {
      return await handleAdminPhoto(event);
    }

    console.warn("Route not found for", path, method);
    return {
      statusCode: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ message: 'Route not found' }),
    };
    
  } catch (error) {
    console.error("Lambda handler error:", error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};
