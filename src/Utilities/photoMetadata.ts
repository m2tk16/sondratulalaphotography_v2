import { useEffect } from "react";
import type { Photo } from "../Portfolio/photoData";
import { photoPath } from "../Portfolio/photoRoutes";

const SITE_NAME = "Sondra Tulala Photography";
const PHOTOGRAPHER = "Sondra Tulala";

export const buildImageStructuredData = (
  photo: Photo,
  imageUrl: string,
  pageUrl: string,
) => ({
  "@context": "https://schema.org",
  "@type": "ImageObject",
  name: photo.title,
  description: photo.description || photo.altText,
  contentUrl: imageUrl,
  url: pageUrl,
  creator: {
    "@type": "Person",
    name: PHOTOGRAPHER,
  },
  creditText: SITE_NAME,
  copyrightNotice: `© ${PHOTOGRAPHER}`,
  ...(photo.capturedAt ? { dateCreated: photo.capturedAt } : {}),
  ...(photo.location
    ? {
        contentLocation: {
          "@type": "Place",
          name: photo.location,
        },
      }
    : {}),
});

const setMetaContent = (
  attribute: "name" | "property",
  key: string,
  content: string,
) => {
  const selector = `meta[${attribute}="${key}"]`;
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  const existed = Boolean(element);
  const previous = element?.content;
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.append(element);
  }
  element.content = content;
  return () => {
    if (!element) return;
    if (existed) {
      element.content = previous ?? "";
    } else {
      element.remove();
    }
  };
};

export const usePhotoMetadata = (
  photo: Photo | null,
  imageUrl: string | null,
) => {
  useEffect(() => {
    if (!photo) return;

    const previousTitle = document.title;
    const title = `${photo.title} | ${SITE_NAME}`;
    const description = photo.description || photo.altText;
    const pageUrl = new URL(photoPath(photo), window.location.origin).toString();
    document.title = title;

    const restoreMeta = [
      setMetaContent("name", "description", description),
      setMetaContent("property", "og:type", "article"),
      setMetaContent("property", "og:site_name", SITE_NAME),
      setMetaContent("property", "og:title", title),
      setMetaContent("property", "og:description", description),
      setMetaContent("property", "og:url", pageUrl),
      setMetaContent("name", "twitter:card", "summary_large_image"),
      setMetaContent("name", "twitter:title", title),
      setMetaContent("name", "twitter:description", description),
    ];
    if (imageUrl) {
      restoreMeta.push(
        setMetaContent("property", "og:image", imageUrl),
        setMetaContent("property", "og:image:alt", photo.altText),
        setMetaContent("name", "twitter:image", imageUrl),
        setMetaContent("name", "twitter:image:alt", photo.altText),
      );
    }

    const canonical = document.createElement("link");
    canonical.rel = "canonical";
    canonical.href = pageUrl;
    canonical.dataset.photoMetadata = "true";
    document.head.append(canonical);

    let structuredData: HTMLScriptElement | null = null;
    if (imageUrl) {
      structuredData = document.createElement("script");
      structuredData.type = "application/ld+json";
      structuredData.dataset.photoMetadata = "true";
      structuredData.text = JSON.stringify(
        buildImageStructuredData(photo, imageUrl, pageUrl),
      );
      document.head.append(structuredData);
    }

    return () => {
      document.title = previousTitle;
      restoreMeta.reverse().forEach((restore) => restore());
      canonical.remove();
      structuredData?.remove();
    };
  }, [imageUrl, photo]);
};
