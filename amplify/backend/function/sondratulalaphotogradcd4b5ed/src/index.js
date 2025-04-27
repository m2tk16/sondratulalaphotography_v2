const { handleRequestInformation } = require('./handlers/requestInformation');
const { handleLikePhoto } = require('./handlers/likePhoto');

exports.handler = async (event) => {
  const path = event.path || '';
  const method = event.httpMethod || '';
  console.log("Incoming path:", path);
  console.log("Incoming method:", method);
  console.log("Incoming event:", JSON.stringify(event));
  try {
    if (path.endsWith('/contact/submit') && method === 'POST') {
      console.log("Routing to contact submission handler");
      return await handleRequestInformation(event);
    }

    if (path.endsWith('/photos/likes') && method === 'POST') {
      return await handleLikePhoto(event);
    }

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
    
  }*/
};
