const test = require("node:test");
const assert = require("node:assert/strict");
const { createRequireAdmin } = require("./adminPhoto");

test("requires an ID token for Studio operations", async () => {
  const verifier = {
    verify: async () => {
      throw new Error("Token should not be verified.");
    },
  };
  const requireAdmin = createRequireAdmin(verifier);

  await assert.rejects(
    requireAdmin({ headers: {} }),
    (error) => error.statusCode === 401 && /ID token/i.test(error.message),
  );
});

test("rejects an invalid Studio ID token", async () => {
  const verifier = {
    verify: async () => {
      throw new Error("Invalid token.");
    },
  };
  const requireAdmin = createRequireAdmin(verifier);

  await assert.rejects(
    requireAdmin({ headers: { Authorization: "Bearer invalid-token" } }),
    (error) => error.statusCode === 401 && /invalid or expired/i.test(error.message),
  );
});

test("rejects a valid non-admin Studio account", async () => {
  const verifier = {
    verify: async () => ({ email: "visitor@example.com", sub: "visitor-id" }),
  };
  const requireAdmin = createRequireAdmin(verifier);

  await assert.rejects(
    requireAdmin({ headers: { authorization: "Bearer valid-token" } }),
    (error) => error.statusCode === 403 && /admin access/i.test(error.message),
  );
});

test("accepts an approved Studio account case-insensitively", async () => {
  const verifier = {
    verify: async (token) => {
      assert.equal(token, "valid-token");
      return {
        email: "SondraTulalaPhotography@GMAIL.COM",
        sub: "approved-admin-id",
      };
    },
  };
  const requireAdmin = createRequireAdmin(verifier);

  const email = await requireAdmin({
    headers: { Authorization: "Bearer valid-token" },
  });

  assert.equal(email, "sondratulalaphotography@gmail.com");
});
