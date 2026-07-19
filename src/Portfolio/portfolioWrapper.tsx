import { useEffect, useState } from "react";
import { get, post } from "aws-amplify/api";
import { fetchAuthSession } from "aws-amplify/auth";
import { Heart, HeartFill } from "react-bootstrap-icons";
import GetImage from "../Utilities/getImage";
import UseAuth from "../Utilities/auth";
import type { Photo } from "./photoData";

const PUBLIC_API = "api4593058b";
const PRIVATE_API = "apid5657c10";

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
          apiName: PUBLIC_API,
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
      const session = await fetchAuthSession();
      const accessToken = session.tokens?.accessToken?.toString();
      if (!accessToken) {
        throw new Error("A valid sign-in session is required.");
      }

      const operation = post({
        apiName: PRIVATE_API,
        path: "/photos/likes",
        options: {
          body: { photo: photo.path },
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      });
      const response = await operation.response;
      const body = (await response.body.json()) as {
        liked?: boolean;
        totalLikes?: number;
      };
      setLiked(Boolean(body.liked));
      setLikeCount(body.totalLikes ?? likeCount);
    } catch {
      setLikeError("Could not save your like.");
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
