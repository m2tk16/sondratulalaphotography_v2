import type { Photo } from "./photoData";

const slugify = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "photograph";

const encodeId = (id: string) => {
  const bytes = new TextEncoder().encode(id);
  const binary = String.fromCharCode(...bytes);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
};

const decodeId = (value: string) => {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  return new TextDecoder().decode(
    Uint8Array.from(binary, (character) => character.charCodeAt(0)),
  );
};

export const photoSlug = (photo: Pick<Photo, "id" | "title">) =>
  `${slugify(photo.title)}--${encodeId(photo.id)}`;

export const photoPath = (photo: Pick<Photo, "id" | "title">) =>
  `/portfolio/${photoSlug(photo)}`;

export const photoIdFromSlug = (slug: string) => {
  const separator = slug.lastIndexOf("--");
  if (separator < 0) return null;
  try {
    return decodeId(slug.slice(separator + 2));
  } catch {
    return null;
  }
};

export const findPhotoBySlug = (photos: Photo[], slug: string) => {
  const id = photoIdFromSlug(slug);
  return id ? photos.find((photo) => photo.id === id) ?? null : null;
};
