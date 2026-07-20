import { getUrl, list, uploadData } from "aws-amplify/storage";

export const MANIFEST_PATH = "public/images/portfolio/manifest.json";

export const PHOTO_CATEGORIES = [
  "Landscapes",
  "Nature",
  "Wildlife",
  "Architecture",
  "Still Life",
  "Featured",
] as const;

export interface Photo {
  id: string;
  path: string;
  title: string;
  altText: string;
  description: string;
  category: string;
  location: string;
  capturedAt: string;
  active: boolean;
  featured: boolean;
  order: number;
}

export interface PhotoMetadataEdits {
  title: string;
  altText: string;
  description: string;
  category: string;
  location: string;
  capturedAt: string;
  active: boolean;
  featured: boolean;
  order: number;
}

const titleFromPath = (path: string) => {
  const filename = path.split("/").pop()?.replace(/\.[^.]+$/, "") ?? "Untitled";
  return filename
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const normalizePhoto = (photo: Partial<Photo>, index: number): Photo => ({
  id: photo.id || photo.path || `photo-${index}`,
  path: photo.path || "",
  title: photo.title || titleFromPath(photo.path || ""),
  altText: photo.altText || photo.title || titleFromPath(photo.path || ""),
  description: photo.description || "",
  category: photo.category || "Nature",
  location: photo.location || "",
  capturedAt: photo.capturedAt || "",
  active: photo.active !== false,
  featured: photo.featured === true,
  order: Number.isFinite(photo.order) ? Number(photo.order) : index,
});

export const updatePhotoMetadata = (
  photos: Photo[],
  photoId: string,
  edits: PhotoMetadataEdits,
): Photo[] => {
  const orderedPhotos = [...photos].sort((a, b) => a.order - b.order);
  const currentIndex = orderedPhotos.findIndex((photo) => photo.id === photoId);
  if (currentIndex < 0) return photos;

  const [currentPhoto] = orderedPhotos.splice(currentIndex, 1);
  const updatedPhoto: Photo = {
    ...currentPhoto,
    title: edits.title.trim(),
    altText: edits.altText.trim(),
    description: edits.description.trim(),
    category: edits.category,
    location: edits.location.trim(),
    capturedAt: edits.capturedAt,
    active: edits.active,
    featured: edits.featured,
  };
  const requestedOrder = Number.isFinite(edits.order)
    ? Math.trunc(edits.order)
    : currentIndex;
  const nextIndex = Math.min(
    Math.max(requestedOrder, 0),
    orderedPhotos.length,
  );
  orderedPhotos.splice(nextIndex, 0, updatedPhoto);

  return orderedPhotos.map((photo, order) => ({ ...photo, order }));
};

const loadLegacyPhotos = async (): Promise<Photo[]> => {
  const result = await list({ prefix: "images/portfolio/" });
  return result.items
    .filter((item) => /\.(avif|jpe?g|png|webp)$/i.test(item.key ?? ""))
    .map((item, index) => {
      const path = `public/${item.key}`;
      return normalizePhoto({ id: item.key, path }, index);
    });
};

export const loadPhotos = async (): Promise<Photo[]> => {
  try {
    const url = await getUrl({ path: MANIFEST_PATH });
    const response = await fetch(url.url);
    if (!response.ok) {
      throw new Error("Photo manifest is unavailable.");
    }
    const photos = (await response.json()) as Partial<Photo>[];
    return photos
      .map(normalizePhoto)
      .filter((photo) => Boolean(photo.path))
      .sort((a, b) => a.order - b.order);
  } catch {
    return loadLegacyPhotos();
  }
};

export const savePhotos = async (photos: Photo[]) => {
  await uploadData({
    path: MANIFEST_PATH,
    data: JSON.stringify(photos, null, 2),
    options: { contentType: "application/json" },
  }).result;
};

export const safeFileName = (fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase() || "jpg";
  const stem = fileName
    .replace(/\.[^.]+$/, "")
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
  return `${stem || `photo-${Date.now()}`}.${extension}`;
};
