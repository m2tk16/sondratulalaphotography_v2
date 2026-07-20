import { useEffect, useState } from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import { Heart, HeartFill } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import GetImage from "../Utilities/getImage";
import UseAuth from "../Utilities/auth";
import {
  PRIVATE_LIKE_API_URL,
  PUBLIC_API_URL,
} from "../config/backend";
import type { Photo } from "./photoData";
import { photoPath } from "./photoRoutes";

const LIKE_ENDPOINT = `${PRIVATE_LIKE_API_URL}/photos/likes`;
const EXPIRED_SESSION = "EXPIRED_SESSION";

const PortfolioWrapper = ({ photo }: { photo: Photo }) => {
  const { user, signIn } = UseAuth();
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [liking, setLiking] = useState(false);
  const [likeError, setLikeError] = useState("");

  useEffect(() => {
    let active = true;
    const query = new URLSearchParams({ photo: photo.path }).toString();
    const loadPublicCount = async () => {
      const response = await fetch(
        `${PUBLIC_API_URL}/photos/likes/count?${query}`,
        { cache: "no-store" },
      );
      if (!response.ok) {
        throw new Error("Could not load the public like count.");
      }
      return (await response.json()) as { totalLikes?: number };
    };
    const loadLikeState = async () => {
      try {
        let body: { liked?: boolean; totalLikes?: number };
        if (user) {
          const session = await fetchAuthSession();
          const accessToken = session.tokens?.accessToken?.toString();
          if (!accessToken) {
            throw new Error(EXPIRED_SESSION);
          }
          const response = await fetch(`${LIKE_ENDPOINT}?${query}`, {
            cache: "no-store",
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (!response.ok) {
            throw new Error("Could not load your like.");
          }
          body = (await response.json()) as {
            liked?: boolean;
            totalLikes?: number;
          };
        } else {
          body = await loadPublicCount();
        }

        if (active) {
          setLikeCount(body.totalLikes ?? 0);
          setLiked(Boolean(body.liked));
        }
      } catch {
        // A signed-in status read should never hide a valid public count.
        try {
          const body = await loadPublicCount();
          if (active) {
            setLikeCount(body.totalLikes ?? 0);
            setLiked(false);
          }
        } catch {
          // Likes are supplementary; photographs should remain available even
          // while the API is being deployed.
        }
      }
    };
    void loadLikeState();
    return () => {
      active = false;
    };
  }, [photo.path, user]);

  const handleLikeClick = async () => {
    if (!user) {
      await signIn();
      return;
    }

    setLiking(true);
    setLikeError("");
    try {
      // Refresh before every write so a browser-restored mobile session cannot
      // send an expired cached token.
      const session = await fetchAuthSession({ forceRefresh: true });
      const accessToken = session.tokens?.accessToken?.toString();
      if (!accessToken) {
        throw new Error(EXPIRED_SESSION);
      }

      // Use the bearer-token API directly. The Lambda verifies the Cognito
      // token server-side, so this request does not need Identity Pool
      // credentials that may be unavailable in a restored mobile session.
      const response = await fetch(LIKE_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ photo: photo.path }),
      });
      const body = (await response.json()) as {
        liked?: boolean;
        message?: string;
        totalLikes?: number;
      };
      if (!response.ok) {
        throw new Error(
          response.status === 401 ? EXPIRED_SESSION : body.message,
        );
      }

      setLiked(Boolean(body.liked));
      setLikeCount(body.totalLikes ?? likeCount);
    } catch (error) {
      setLikeError(
        error instanceof Error && error.message === EXPIRED_SESSION
          ? "Your sign-in expired. Sign out, then sign in again."
          : "Could not save your like. Please try again.",
      );
    } finally {
      setLiking(false);
    }
  };

  return (
    <article className="photo-card">
      <div className="photo-frame">
        <Link
          aria-label={`View ${photo.title}`}
          className="photo-view-link"
          to={photoPath(photo)}
        >
          <GetImage
            alt={photo.altText}
            imagePath={photo.path}
            className="portfolio-image"
            sizes="(max-width: 620px) calc(100vw - 2rem), (max-width: 1200px) 50vw, 700px"
          />
          <span aria-hidden className="view-photo-label">View photograph</span>
        </Link>
      </div>
      <div className="photo-details">
        <div>
          <p className="photo-category">{photo.category}</p>
          <h2>
            <Link to={photoPath(photo)}>{photo.title}</Link>
          </h2>
          {(photo.location || photo.capturedAt) && (
            <p className="photo-meta">
              {[photo.location, photo.capturedAt].filter(Boolean).join(" · ")}
            </p>
          )}
          {photo.description && (
            <p className="photo-description">{photo.description}</p>
          )}
        </div>
        <button
          aria-label={
            user
              ? `${liked ? "Remove like from" : "Like"} ${photo.title}`
              : `Sign in to like ${photo.title}`
          }
          className={`like-button ${liked ? "liked" : ""}`}
          disabled={liking}
          onClick={handleLikeClick}
          title={user ? "Like this photograph" : "Sign in with Google to like"}
          type="button"
        >
          {liked ? <HeartFill aria-hidden /> : <Heart aria-hidden />}
          <span>{likeCount}</span>
        </button>
      </div>
      {likeError && <p className="inline-error">{likeError}</p>}
    </article>
  );
};

export default PortfolioWrapper;
