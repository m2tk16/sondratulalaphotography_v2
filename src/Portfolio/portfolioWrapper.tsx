import { useEffect, useState } from "react";
import { get } from "aws-amplify/api";
import { fetchAuthSession } from "aws-amplify/auth";
import { Heart, HeartFill } from "react-bootstrap-icons";
import GetImage from "../Utilities/getImage";
import UseAuth from "../Utilities/auth";
import {
  PRIVATE_LIKE_API_URL,
  PUBLIC_API_NAME,
} from "../config/backend";
import type { Photo } from "./photoData";

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
    const loadCount = async () => {
      try {
        const operation = get({
          apiName: PUBLIC_API_NAME,
          path: "/photos/likes/count",
          options: { queryParams: { photo: photo.path } },
        });
        const response = await operation.response;
        const body = (await response.body.json()) as { totalLikes?: number };
        if (active) {
          setLikeCount(body.totalLikes ?? 0);
        }
      } catch {
        // Likes are supplementary; photographs should remain available even
        // while the API is being deployed.
      }
    };
    void loadCount();
    return () => {
      active = false;
    };
  }, [photo.path]);

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
        <GetImage imagePath={photo.path} className="portfolio-image" />
        {photo.featured && <span className="featured-label">Featured</span>}
      </div>
      <div className="photo-details">
        <div>
          <p className="photo-category">{photo.category}</p>
          <h2>{photo.title}</h2>
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
