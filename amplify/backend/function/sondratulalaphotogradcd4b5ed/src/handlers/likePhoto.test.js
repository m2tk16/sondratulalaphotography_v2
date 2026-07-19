const test = require("node:test");
const assert = require("node:assert/strict");
const { createLikeHandler } = require("./likePhoto");

const request = (result) => ({ promise: async () => result });

test("rejects a like without a photograph path", async () => {
  const handler = createLikeHandler({});
  const result = await handler({ httpMethod: "POST", body: "{}" });

  assert.equal(result.statusCode, 400);
  assert.match(result.body, /photograph path/i);
});

test("requires a valid Cognito access token for likes", async () => {
  const verifier = {
    verify: async () => {
      throw new Error("Token should not be verified.");
    },
  };
  const handler = createLikeHandler({}, verifier);
  const result = await handler({
    httpMethod: "POST",
    body: JSON.stringify({ photo: "public/images/portfolio/fog.webp" }),
  });

  assert.equal(result.statusCode, 401);
  assert.match(result.body, /sign in/i);
});

test("rejects an invalid Cognito access token", async () => {
  const verifier = {
    verify: async () => {
      throw new Error("Invalid token.");
    },
  };
  const handler = createLikeHandler({}, verifier);
  const result = await handler({
    httpMethod: "POST",
    body: JSON.stringify({ photo: "public/images/portfolio/fog.webp" }),
    headers: { Authorization: "Bearer expired-token" },
  });

  assert.equal(result.statusCode, 401);
  assert.match(result.body, /sign in/i);
});

test("toggles a like using the verified Cognito subject and returns the total", async () => {
  const calls = { get: [], put: [], scan: [] };
  const documentClient = {
    get: (params) => {
      calls.get.push(params);
      return request({});
    },
    put: (params) => {
      calls.put.push(params);
      return request({});
    },
    scan: (params) => {
      calls.scan.push(params);
      return request({ Count: 4 });
    },
  };
  const verifier = {
    verify: async (token) => {
      assert.equal(token, "valid-access-token");
      return { sub: "verified-user-id" };
    },
  };
  const handler = createLikeHandler(documentClient, verifier);
  const photo = "public/images/portfolio/fog.webp";

  const result = await handler({
    httpMethod: "POST",
    body: JSON.stringify({
      photo,
      username: "browser-supplied-value-must-be-ignored",
    }),
    headers: { authorization: "Bearer valid-access-token" },
  });

  assert.equal(result.statusCode, 200);
  assert.deepEqual(JSON.parse(result.body), { liked: true, totalLikes: 4 });
  assert.deepEqual(calls.get[0].Key, {
    username: "verified-user-id",
    photo,
  });
  assert.equal(calls.put[0].Item.username, "verified-user-id");
  assert.equal(calls.put[0].Item.liked, "Y");
  assert.equal(calls.scan.length, 1);
});

test("removes an existing like", async () => {
  const documentClient = {
    get: () => request({ Item: { liked: "Y" } }),
    put: (params) => {
      assert.equal(params.Item.liked, "N");
      return request({});
    },
    scan: () => request({ Count: 2 }),
  };
  const verifier = {
    verify: async () => ({ sub: "verified-user-id" }),
  };
  const handler = createLikeHandler(documentClient, verifier);
  const result = await handler({
    httpMethod: "POST",
    body: JSON.stringify({ photo: "public/images/portfolio/fog.webp" }),
    headers: { Authorization: "Bearer valid-access-token" },
  });

  assert.deepEqual(JSON.parse(result.body), { liked: false, totalLikes: 2 });
});

test("counts every paginated scan page for public totals", async () => {
  let page = 0;
  const documentClient = {
    scan: (params) => {
      page += 1;
      if (page === 1) {
        assert.equal(params.ExclusiveStartKey, undefined);
        return request({ Count: 3, LastEvaluatedKey: { username: "next" } });
      }
      assert.deepEqual(params.ExclusiveStartKey, { username: "next" });
      return request({ Count: 2 });
    },
  };
  const handler = createLikeHandler(documentClient);
  const result = await handler({
    httpMethod: "GET",
    queryStringParameters: {
      photo: "public/images/portfolio/fog.webp",
    },
  });

  assert.deepEqual(JSON.parse(result.body), { totalLikes: 5 });
  assert.equal(page, 2);
});
