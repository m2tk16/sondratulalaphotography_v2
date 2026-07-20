import test from "node:test";
import assert from "node:assert/strict";
import { createRequireAdmin, validateManifest } from "./adminPhoto.js";

const validPhoto = {
  id: "flowers",
  path: "public/images/portfolio/flowers.jpg",
  title: "Flowers",
  altText: "Purple flowers clustered along green stems",
  description: "Spring flowers in soft afternoon light.",
  category: "Nature",
  location: "Knoxville, TN",
  capturedAt: "2026-04-12",
  active: true,
  featured: false,
  order: 0,
};

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

test("accepts complete photograph metadata", () => {
  const serialized = validateManifest([validPhoto]);

  assert.deepEqual(JSON.parse(serialized), [validPhoto]);
});

test("rejects incomplete or malformed photograph metadata", () => {
  const invalidPhotos = [
    { ...validPhoto, title: " " },
    { ...validPhoto, altText: "" },
    { ...validPhoto, category: "Unknown" },
    { ...validPhoto, category: "Featured" },
    { ...validPhoto, capturedAt: "2026-02-30" },
    { ...validPhoto, active: "yes" },
    { ...validPhoto, order: -1 },
  ];

  for (const photo of invalidPhotos) {
    assert.throws(
      () => validateManifest([photo]),
      (error) =>
        error.statusCode === 400 && /invalid photo metadata/i.test(error.message),
    );
  }
});

test("accepts one active homepage photo", () => {
  const homepagePhoto = { ...validPhoto, featured: true };
  const serialized = validateManifest([homepagePhoto]);

  assert.deepEqual(JSON.parse(serialized), [homepagePhoto]);
});

test("rejects an inactive or duplicate homepage photo", () => {
  assert.throws(
    () =>
      validateManifest([
        { ...validPhoto, active: false, featured: true },
      ]),
    (error) => error.statusCode === 400 && /homepage photo/i.test(error.message),
  );

  assert.throws(
    () =>
      validateManifest([
        { ...validPhoto, featured: true },
        {
          ...validPhoto,
          id: "second",
          path: "public/images/portfolio/second.jpg",
          title: "Second",
          featured: true,
          order: 1,
        },
      ]),
    (error) => error.statusCode === 400 && /homepage photo/i.test(error.message),
  );
});

test("rejects duplicate photograph IDs and paths", () => {
  assert.throws(
    () =>
      validateManifest([
        validPhoto,
        { ...validPhoto, title: "Second record", order: 1 },
      ]),
    (error) => error.statusCode === 400,
  );
});
