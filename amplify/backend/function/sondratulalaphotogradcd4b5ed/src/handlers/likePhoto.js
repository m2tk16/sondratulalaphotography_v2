const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = 'SondraTulalaPhotography-PhotoLikes';

exports.handleLikePhoto = async (event) => {
  try {
    const { username, photo } = JSON.parse(event.body || '{}');

    if (!username || !photo) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing username or photo." }),
      };
    }

    // 1. Check existing like
    const existing = await ddb
      .get({
        TableName: TABLE_NAME,
        Key: { username, photo },
      })
      .promise();

    const previouslyLiked = existing.Item?.liked === 'Y';
    const newLikedValue = previouslyLiked ? 'N' : 'Y';
    const now = new Date().toISOString();

    // 2. Update (or insert) the new like state
    await ddb
      .put({
        TableName: TABLE_NAME,
        Item: {
          username,
          photo,
          liked: newLikedValue,
          last_updated: now,
        },
      })
      .promise();

    // 3. Get total likes for this photo
    const result = await ddb
      .query({
        TableName: "SondraTulalaPhotography-PhotoLikes",
        KeyConditionExpression: 'photo = :photoVal AND liked = :likeVal',
        ExpressionAttributeValues: {
          ':photoVal': photo,
          ':likeVal': 'Y',
        },
      })
      .promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Like toggled successfully',
        liked: newLikedValue,
        totalLikes: result.Count,
      }),
    };
  } catch (error) {
    console.error("Error in handleLikePhoto:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Server error", error }),
    };
  }
};
