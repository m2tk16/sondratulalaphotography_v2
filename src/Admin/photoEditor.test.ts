import test from "node:test";
import assert from "node:assert/strict";
import {
  updatePhotoMetadata,
  type Photo,
} from "../Portfolio/photoData";

const photos: Photo[] = [
  {
    id: "first",
    path: "public/images/portfolio/first.jpg",
    title: "First",
    altText: "First photograph",
    description: "",
    category: "Nature",
    location: "",
    capturedAt: "",
    active: true,
    featured: false,
    order: 0,
  },
  {
    id: "second",
    path: "public/images/portfolio/second.jpg",
    title: "Second",
    altText: "Second photograph",
    description: "",
    category: "Landscapes",
    location: "",
    capturedAt: "",
    active: true,
    featured: false,
    order: 1,
  },
];

test("updates every editable field, preserves identity, and reorders", () => {
  const updated = updatePhotoMetadata(photos, "first", {
    title: "  Updated title  ",
    altText: "  Descriptive alternative text  ",
    description: "  Updated description  ",
    category: "Wildlife",
    location: "  Chattanooga, TN  ",
    capturedAt: "2026-07-19",
    active: false,
    featured: true,
    order: 1,
  });

  assert.deepEqual(
    updated.map(({ id, order }) => ({ id, order })),
    [
      { id: "second", order: 0 },
      { id: "first", order: 1 },
    ],
  );
  assert.deepEqual(updated[1], {
    id: "first",
    path: "public/images/portfolio/first.jpg",
    title: "Updated title",
    altText: "Descriptive alternative text",
    description: "Updated description",
    category: "Wildlife",
    location: "Chattanooga, TN",
    capturedAt: "2026-07-19",
    active: false,
    featured: true,
    order: 1,
  });
});

test("clamps an out-of-range position and leaves unknown IDs unchanged", () => {
  const moved = updatePhotoMetadata(photos, "first", {
    ...photos[0],
    order: 99,
  });
  assert.equal(moved.at(-1)?.id, "first");
  assert.deepEqual(
    moved.map(({ order }) => order),
    [0, 1],
  );

  assert.equal(
    updatePhotoMetadata(photos, "missing", {
      ...photos[0],
      order: 0,
    }),
    photos,
  );
});
