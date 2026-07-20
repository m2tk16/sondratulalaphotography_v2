import React, { useState, useEffect } from "react";
import Spinner from "react-bootstrap/Spinner";
import Image from "react-bootstrap/Image";
import { getUrl } from "@aws-amplify/storage";

interface GetImageProps {
  imagePath: string;
  alt?: string;
  className?: string;
  fluid?: boolean;
  loading?: "eager" | "lazy";
}

const GetImage: React.FC<GetImageProps> = ({
  imagePath,
  alt = "",
  className = "",
  fluid = true,
  loading = "lazy",
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setImageUrl(null);

    async function fetchImage() {
      try {
        const urlResponse = await getUrl({ path: imagePath });
        if (active) setImageUrl(urlResponse.url.toString());
      } catch (error) {
        if (active) console.error("Error fetching image:", error);
      }
    }

    void fetchImage();
    return () => {
      active = false;
    };
  }, [imagePath]);

  return (
    <>
      {imageUrl ? (
        <Image
          alt={alt}
          className={className}
          src={imageUrl}
          fluid={fluid}
          loading={loading}
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
