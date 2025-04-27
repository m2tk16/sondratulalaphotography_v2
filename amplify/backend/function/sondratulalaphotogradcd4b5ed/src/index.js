/* Amplify Params - DO NOT EDIT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const { handleRequestInformation } = require('./handlers/requestInformation');
const { handleLikePhoto } = require('./handlers/likePhoto');

exports.handler = async (event) => {
  console.log(event)

  console.log("Incoming path:", event.path);
  console.log("Incoming method:", event.httpMethod);
  console.log("Incoming event body:", JSON.stringify(event.body));
  try {
    const path = event.path || '';
    const method = event.httpMethod || '';

    if (path.endsWith('/contact/submit') && method === 'POST') {
      console.log("Routing to contact submission handler");
      return await handleRequestInformation(event);
    }

    if (path.endsWith('/photos/likes') && method === 'POST') {
      console.log("Routing to photo like handler");
      return await handleLikePhoto(event);
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
      body: JSON.stringify({ message: 'Internal server error', error: error.message }),
    };
  }
};
