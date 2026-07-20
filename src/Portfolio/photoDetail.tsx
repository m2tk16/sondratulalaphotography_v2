import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Share,
  X,
} from "react-bootstrap-icons";
import { Link, useNavigate, useParams } from "react-router-dom";
import GetImage from "../Utilities/getImage";
import { usePhotoMetadata } from "../Utilities/photoMetadata";
import { loadPhotos, type Photo } from "./photoData";
import { findPhotoBySlug, photoPath } from "./photoRoutes";
import "./photoDetail.css";

const PhotoDetail = () => {
  const { photoSlug = "" } = useParams();
  const navigate = useNavigate();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState("");

  useEffect(() => {
    loadPhotos()
      .then(setPhotos)
      .catch(() => setError("This photograph could not be loaded."))
      .finally(() => setLoading(false));
  }, []);

  const activePhotos = useMemo(
    () => photos.filter((candidate) => candidate.active),
    [photos],
  );
  const photo = useMemo(
    () => findPhotoBySlug(activePhotos, photoSlug),
    [activePhotos, photoSlug],
  );
  const currentIndex = photo
    ? activePhotos.findIndex((candidate) => candidate.id === photo.id)
    : -1;
  const previous =
    currentIndex > 0 ? activePhotos[currentIndex - 1] : null;
  const next =
    currentIndex >= 0 && currentIndex < activePhotos.length - 1
      ? activePhotos[currentIndex + 1]
      : null;

  usePhotoMetadata(photo, imageUrl);

  useEffect(() => {
    setImageUrl(null);
    setShareStatus("");
    headingRef.current?.focus({ preventScroll: true });
  }, [photo?.id]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") navigate("/portfolio");
      if (event.key === "ArrowLeft" && previous) {
        navigate(photoPath(previous));
      }
      if (event.key === "ArrowRight" && next) navigate(photoPath(next));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate, next, previous]);

  const sharePhoto = async () => {
    if (!photo) return;
    const data = {
      title: `${photo.title} | Sondra Tulala Photography`,
      text: photo.description || photo.altText,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(data);
        setShareStatus("Share sheet opened.");
      } else {
        await navigator.clipboard.writeText(data.url);
        setShareStatus("Link copied.");
      }
    } catch (shareError) {
      if (
        shareError instanceof DOMException &&
        shareError.name === "AbortError"
      ) {
        return;
      }
      setShareStatus("Could not copy the link.");
    }
  };

  if (loading) {
    return <div className="gallery-message">Opening the photograph…</div>;
  }
  if (error || !photo) {
    return (
      <div className="photo-not-found">
        <p className="eyebrow">Photograph unavailable</p>
        <h1>This moment is no longer in the public collection.</h1>
        <Link className="text-link" to="/portfolio">
          Return to the portfolio
        </Link>
      </div>
    );
  }

  return (
    <article className="photo-viewer">
      <div className="viewer-toolbar">
        <Link aria-label="Close photograph and return to portfolio" to="/portfolio">
          <X aria-hidden />
        </Link>
        <button onClick={() => void sharePhoto()} type="button">
          <Share aria-hidden />
          Share
        </button>
      </div>

      <div className="viewer-stage">
        <GetImage
          alt={photo.altText}
          className="viewer-image"
          fetchPriority="high"
          imagePath={photo.path}
          loading="eager"
          onUrlChange={setImageUrl}
          sizes="(max-width: 820px) 100vw, 72vw"
        />
        {previous && (
          <Link
            aria-label={`Previous photograph: ${previous.title}`}
            className="viewer-arrow previous"
            to={photoPath(previous)}
          >
            <ArrowLeft aria-hidden />
          </Link>
        )}
        {next && (
          <Link
            aria-label={`Next photograph: ${next.title}`}
            className="viewer-arrow next"
            to={photoPath(next)}
          >
            <ArrowRight aria-hidden />
          </Link>
        )}
      </div>

      <div className="viewer-details">
        <div>
          <p className="photo-category">{photo.category}</p>
          <h1 ref={headingRef} tabIndex={-1}>{photo.title}</h1>
          {(photo.location || photo.capturedAt) && (
            <p className="photo-meta">
              {[photo.location, photo.capturedAt].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
        {photo.description && <p>{photo.description}</p>}
        <p aria-live="polite" className="share-status">
          {shareStatus}
        </p>
      </div>
    </article>
  );
};

export default PhotoDetail;
