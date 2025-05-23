import React, { useState, useEffect } from "react";
import "./portfolio.css";
import GetImage from "../Utilities/getImage";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { Heart, CurrencyBitcoin } from "react-bootstrap-icons";
import { FaPaypal } from "react-icons/fa";
import ExtractAndFormat from "../Utilities/titleFormatter";
import { fetchAuthSession } from "@aws-amplify/auth";

interface PortfolioWrapperProps {
  path: string;
}

// ✅ Use inferred return type from fetchAuthSession
type AuthSessionType = Awaited<ReturnType<typeof fetchAuthSession>>;

const PortfolioWrapper: React.FC<PortfolioWrapperProps> = ({ path }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [authSession, setAuthSession] = useState<AuthSessionType | null>(null);
  const title = <ExtractAndFormat path={path} />;

  useEffect(() => {
    setIsVisible(true);
    setLikeCount(1);
  }, []);

  useEffect(() => {
    setIsVisible(true);

    const fetchUserSession = async () => {
      try {
        const session = await fetchAuthSession();
        setAuthSession(session);
      } catch (error) {
        console.error("Error fetching session:", error);
      }
    };

    fetchUserSession();
  }, []);

  const handleLikeClick = async () => {
    const accessToken = authSession?.tokens?.accessToken?.payload;

    if (!accessToken) {
      console.error("User is not authenticated. Cannot like the photo.");
      return;
    }

    try {
      const response = await fetch(
        "https://wco3y6e125.execute-api.us-east-1.amazonaws.com/main/photos/likes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: accessToken.sub || "",
          },
          body: JSON.stringify({
            username: accessToken.username,
            photo: path,
            liked: "Y",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Like Response:", result);
      setLikeCount(result.totalLikes || 0);
    } catch (error) {
      console.error("Error liking the photo:", error);
    }
  };

  return (
    <div className="p-6 portfolio-image-wrapper">
      <GetImage
        imagePath={path}
        className={`home-image ${isVisible ? "visible" : ""}`}
      />
      <Col>
        <Row className="mt-3">
          <div className="image-title">{title}</div>
        </Row>
        <hr />
        <Row className="mt-4">
          <Col className="col-4 text-center">
            <Heart size={20} className="like-icon" onClick={handleLikeClick} />
            <div className="like-count">{likeCount}</div>
          </Col>
          <Col className="col-4 text-center">
            <CurrencyBitcoin size={30} />
          </Col>
          <Col className="col-4 text-center">
            <FaPaypal size={30} />
          </Col>
        </Row>
      </Col>
    </div>
  );
};

export default PortfolioWrapper;
