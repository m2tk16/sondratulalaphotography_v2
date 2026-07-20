import React, { useState, useEffect } from "react";
import Spinner from "react-bootstrap/Spinner";
import Image from "react-bootstrap/Image";
import { getUrl } from "@aws-amplify/storage";

interface GetImageProps {
  imagePath: string;
  alt?: string;
  className?: string;
  fluid?: boolean;
  fetchPriority?: "high" | "low" | "auto";
  loading?: "eager" | "lazy";
  onUrlChange?: (url: string | null) => void;
  sizes?: string;
}

const GetImage: React.FC<GetImageProps> = ({
  imagePath,
  alt = "",
  className = "",
  fluid = true,
  fetchPriority = "auto",
  loading = "lazy",
  onUrlChange,
  sizes,
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setImageUrl(null);
    onUrlChange?.(null);

    async function fetchImage() {
      try {
        const urlResponse = await getUrl({ path: imagePath });
        if (active) {
          const resolvedUrl = urlResponse.url.toString();
          setImageUrl(resolvedUrl);
          onUrlChange?.(resolvedUrl);
        }
      } catch (error) {
        if (active) console.error("Error fetching image:", error);
      }
    }

    void fetchImage();
    return () => {
      active = false;
    };
  }, [imagePath, onUrlChange]);

  return (
    <>
      {imageUrl ? (
        <Image
          alt={alt}
          className={className}
          decoding="async"
          {...({ fetchpriority: fetchPriority } as Record<string, string>)}
          src={imageUrl}
          fluid={fluid}
          loading={loading}
          sizes={sizes}
        />
      ) : (
        <div className="loading-spinner">
          <Spinner animation="border" role="status"></Spinner>
        </div>
      )}
    </>
  );
};

export default GetImage;
