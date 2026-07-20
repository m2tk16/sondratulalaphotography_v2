import test from "node:test";
import assert from "node:assert/strict";
import {
  findPhotoBySlug,
  photoIdFromSlug,
  photoPath,
  photoSlug,
} from "./photoRoutes";
import type { Photo } from "./photoData";
import { buildImageStructuredData } from "../Utilities/photoMetadata";

const photo: Photo = {
  id: "images/portfolio/Mist & Light.jpg",
  path: "public/images/portfolio/mist.jpg",
  title: "Mist & Morning Light",
  altText: "Morning mist over a wooded ridge",
  description: "",
  category: "Landscapes",
  location: "",
  capturedAt: "",
  active: true,
  featured: false,
  order: 0,
};

test("creates readable, URL-safe, reversible photograph routes", () => {
  const slug = photoSlug(photo);

  assert.match(slug, /^mist-morning-light--[A-Za-z0-9_-]+$/);
  assert.equal(photoIdFromSlug(slug), photo.id);
  assert.equal(photoPath(photo), `/portfolio/${slug}`);
  assert.equal(findPhotoBySlug([photo], slug), photo);
});

test("keeps old shared links resolvable after a title change", () => {
  const oldSlug = photoSlug(photo);
  const renamed = { ...photo, title: "A New Title" };

  assert.equal(findPhotoBySlug([renamed], oldSlug), renamed);
  assert.equal(photoIdFromSlug("not-a-photo"), null);
  assert.equal(photoIdFromSlug("invalid--%%%"), null);
});

test("builds creator, copyright, and photograph discovery metadata", () => {
  const datedPhoto = {
    ...photo,
    description: "A quiet ridge emerging through morning fog.",
    capturedAt: "2026-04-12",
    location: "Great Smoky Mountains, TN",
  };
  const metadata = buildImageStructuredData(
    datedPhoto,
    "https://images.example/photo.jpg",
    "https://example.com/portfolio/photo",
  );

  assert.equal(metadata["@type"], "ImageObject");
  assert.equal(metadata.name, datedPhoto.title);
  assert.equal(metadata.creator.name, "Sondra Tulala");
  assert.equal(metadata.copyrightNotice, "© Sondra Tulala");
  assert.equal(metadata.dateCreated, "2026-04-12");
  assert.equal(metadata.contentLocation?.name, datedPhoto.location);
});
