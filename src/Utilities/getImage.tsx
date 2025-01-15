import React, { useState, useEffect } from "react";
import Spinner from "react-bootstrap/Spinner";
import Image from "react-bootstrap/Image";
import { getUrl } from "@aws-amplify/storage";

interface GetImageProps {
  imagePath: string;
  className?: string;
  fluid?: boolean;
}

const GetImage: React.FC<GetImageProps> = ({ imagePath, className = "", fluid = true }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchImage() {
      try {
        const urlResponse = await getUrl({ path: imagePath });
        setImageUrl(urlResponse.url.toString());;
      } catch (error) {
        console.error("Error fetching image:", error);
      }
    }

    fetchImage();
  }, [imagePath]);

  return (
    <>
      {imageUrl ? (
        <Image className={className} src={imageUrl} fluid={fluid} loading="lazy" />
      ) : (
        <div className="loading-spinner">
          <Spinner animation="border" role="status"></Spinner>
        </div>
      )}
    </>
  );
};

export default GetImage;
