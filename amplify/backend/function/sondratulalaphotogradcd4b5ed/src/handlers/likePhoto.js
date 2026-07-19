const AWS = require("aws-sdk");
const { CognitoJwtVerifier } = require("aws-jwt-verify");

const ddb = new AWS.DynamoDB.DocumentClient();
const tokenVerifier = CognitoJwtVerifier.create({
  userPoolId: process.env.USER_POOL_ID || "us-east-1_Ag1DJ56zy",
  tokenUse: "access",
  clientId: process.env.USER_POOL_CLIENT_ID || "6q431rsrfrbteccluagbdl5ucs",
});

const TABLE_NAME =
  process.env.PHOTO_LIKES_TABLE || "SondraTulalaPhotography-PhotoLikes";
const headers = {
  "Access-Control-Allow-Headers":
    "Content-Type,Authorization,X-Amz-Date,X-Amz-Security-Token",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
  "Content-Type": "application/json",
};

const response = (statusCode, body) => ({
  statusCode,
  headers,
  body: JSON.stringify(body),
});

const countLikes = async (documentClient, photo) => {
  let totalLikes = 0;
  let lastEvaluatedKey;
  do {
    const result = await documentClient
      .scan({
        TableName: TABLE_NAME,
        FilterExpression: "photo = :photo AND liked = :liked",
        ExpressionAttributeValues: {
          ":photo": photo,
          ":liked": "Y",
        },
        ExclusiveStartKey: lastEvaluatedKey,
        Select: "COUNT",
      })
      .promise();
    totalLikes += result.Count || 0;
    lastEvaluatedKey = result.LastEvaluatedKey;
  } while (lastEvaluatedKey);
  return totalLikes;
};

const getAuthenticatedUsername = async (event, verifier) => {
  const authorization =
    event.headers?.Authorization || event.headers?.authorization || "";
  const accessToken = authorization.replace(/^Bearer\s+/i, "");
  if (!accessToken) return "";

  try {
    const payload = await verifier.verify(accessToken);
    return typeof payload.sub === "string" ? payload.sub : "";
  } catch {
    return "";
  }
};

const createLikeHandler =
  (documentClient, verifier = tokenVerifier) => async (event) => {
  try {
    const method = event.httpMethod || "";
    const photo =
      method === "GET"
        ? event.queryStringParameters?.photo
        : JSON.parse(event.body || "{}").photo;

    if (!photo || typeof photo !== "string") {
      return response(400, { message: "A photograph path is required." });
    }

    if (method === "GET") {
      return response(200, { totalLikes: await countLikes(documentClient, photo) });
    }

    // Validate the Cognito User Pool access token server-side and derive the
    // identity from Cognito rather than accepting one from the browser.
    const username = await getAuthenticatedUsername(event, verifier);
    if (!username) {
      return response(401, { message: "Sign in to like a photograph." });
    }

    const existing = await documentClient
      .get({
        TableName: TABLE_NAME,
        Key: { username, photo },
      })
      .promise();
    const liked = existing.Item?.liked !== "Y";

    await documentClient
      .put({
        TableName: TABLE_NAME,
        Item: {
          username,
          photo,
          liked: liked ? "Y" : "N",
          last_updated: new Date().toISOString(),
        },
      })
      .promise();

    return response(200, {
      liked,
      totalLikes: await countLikes(documentClient, photo),
    });
  } catch (error) {
    console.error("Photo like error:", error);
    return response(500, { message: "Could not update this like." });
  }
};

exports.handleLikePhoto = createLikeHandler(ddb);
exports.createLikeHandler = createLikeHandler;
