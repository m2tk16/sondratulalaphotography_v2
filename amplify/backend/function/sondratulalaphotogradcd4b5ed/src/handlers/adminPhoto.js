const AWS = require("aws-sdk");
const crypto = require("crypto");
const { CognitoJwtVerifier } = require("aws-jwt-verify");

const s3 = new AWS.S3({ signatureVersion: "v4" });
let adminTokenVerifier;
const requiredConfig = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required configuration: ${name}`);
  return value;
};
const getAdminTokenVerifier = () => {
  if (!adminTokenVerifier) {
    adminTokenVerifier = CognitoJwtVerifier.create({
      userPoolId: requiredConfig("USER_POOL_ID"),
      tokenUse: "id",
      clientId: requiredConfig("USER_POOL_CLIENT_ID"),
    });
  }
  return adminTokenVerifier;
};
const bucketName = () => requiredConfig("PHOTO_BUCKET");
const MANIFEST_KEY = "public/images/portfolio/manifest.json";
const PHOTO_PREFIX = "public/images/portfolio/";
const ADMIN_EMAILS = new Set([
  "t.sondra1947@gmail.com",
  "sondratulalaphotography@gmail.com",
]);
const ALLOWED_CONTENT_TYPES = new Set([
  "image/avif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const headers = {
  "Access-Control-Allow-Headers": "Authorization,Content-Type",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "OPTIONS,POST,PUT,DELETE",
  "Content-Type": "application/json",
};

const response = (statusCode, body) => ({
  statusCode,
  headers,
  body: JSON.stringify(body),
});

const createRequireAdmin = (verifier) => async (event) => {
    const authorization =
      event.headers?.Authorization || event.headers?.authorization || "";
    const idToken = authorization.replace(/^Bearer\s+/i, "");
    if (!idToken) {
      throw Object.assign(new Error("Missing ID token."), { statusCode: 401 });
    }

    let payload;
    try {
      payload = await verifier.verify(idToken);
    } catch {
      throw Object.assign(new Error("Invalid or expired ID token."), {
        statusCode: 401,
      });
    }

    const email =
      typeof payload.email === "string" ? payload.email.toLowerCase() : "";
    if (!email || !ADMIN_EMAILS.has(email)) {
      throw Object.assign(new Error("Admin access is required."), {
        statusCode: 403,
      });
    }
    return email;
  };

const requireAdmin = (event) =>
  createRequireAdmin(getAdminTokenVerifier())(event);
const readBody = (event) => {
  try {
    return JSON.parse(event.body || "{}");
  } catch {
    throw Object.assign(new Error("Invalid JSON body."), { statusCode: 400 });
  }
};

const validateManifest = (photos) => {
  if (!Array.isArray(photos) || photos.length > 1000) {
    throw Object.assign(new Error("Invalid photo manifest."), { statusCode: 400 });
  }
  const serialized = JSON.stringify(photos, null, 2);
  if (Buffer.byteLength(serialized, "utf8") > 1024 * 1024) {
    throw Object.assign(new Error("Photo manifest is too large."), {
      statusCode: 400,
    });
  }
  for (const photo of photos) {
    if (
      !photo ||
      typeof photo.path !== "string" ||
      !photo.path.startsWith(PHOTO_PREFIX) ||
      photo.path === MANIFEST_KEY
    ) {
      throw Object.assign(new Error("Manifest contains an invalid photo path."), {
        statusCode: 400,
      });
    }
  }
  return serialized;
};

const writeManifest = async (photos) => {
  const body = validateManifest(photos);
  await s3
    .putObject({
      Bucket: bucketName(),
      Key: MANIFEST_KEY,
      Body: body,
      ContentType: "application/json",
      CacheControl: "no-cache",
    })
    .promise();
};

exports.handleAdminPhoto = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return response(204, {});
  }

  try {
    await requireAdmin(event);
    const path = event.path || "";
    const method = event.httpMethod || "";
    const body = readBody(event);

    if (path.endsWith("/admin/upload-url") && method === "POST") {
      const contentType = String(body.contentType || "").toLowerCase();
      if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
        return response(400, { message: "Unsupported image type." });
      }
      const extension = String(body.filename || "").split(".").pop()?.toLowerCase();
      if (!extension || !["avif", "jpg", "jpeg", "png", "webp"].includes(extension)) {
        return response(400, { message: "Unsupported file extension." });
      }
      const key = `${PHOTO_PREFIX}${crypto.randomUUID()}.${extension}`;
      const uploadUrl = await s3.getSignedUrlPromise("putObject", {
        Bucket: bucketName(),
        Key: key,
        ContentType: contentType,
        Expires: 300,
      });
      return response(200, { path: key, uploadUrl });
    }

    if (path.endsWith("/admin/manifest") && method === "PUT") {
      await writeManifest(body.photos);
      return response(200, { message: "Portfolio updated." });
    }

    if (path.endsWith("/admin/photo") && method === "DELETE") {
      const key = String(body.path || "");
      if (!key.startsWith(PHOTO_PREFIX) || key === MANIFEST_KEY) {
        return response(400, { message: "Invalid photograph path." });
      }
      await s3.deleteObject({ Bucket: bucketName(), Key: key }).promise();
      await writeManifest(body.photos);
      return response(200, { message: "Photograph deleted." });
    }

    return response(404, { message: "Admin route not found." });
  } catch (error) {
    console.error("Admin photo handler error:", error);
    return response(error.statusCode || 500, {
      message: error.statusCode ? error.message : "Server error.",
    });
  }
};

exports.createRequireAdmin = createRequireAdmin;
