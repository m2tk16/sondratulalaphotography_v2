import { useState, useEffect } from "react";
import "./portfolio.css";
import Container from 'react-bootstrap/Container';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from 'react-bootstrap/Card';
import PortfolioWrapper from './portfolioWrapper';
import { list } from "@aws-amplify/storage";


const Portfolio = () => {
  const [imageArray, setImageArray] = useState<string[]>([]);

    useEffect(() => {
        const fetchImages = async () => {
          try {
            const result = await list({ prefix: "images/portfolio/" });
            console.log(result);
            const filteredImages = result.items.filter(
              (item) =>
                item.key &&
                (item.key.endsWith(".png") || item.key.endsWith(".jpg") || item.key.endsWith(".webp"))
            );
            
            const filenames = filteredImages.map((item) => {
              const parts = "public/" + item.key;
              return parts;
            });
            
            setImageArray(filenames);

          } catch (err) {
            console.error("Error fetching images:", err);
          }
        };
    
        fetchImages();
      }, []);

    
    return (
        <Container>
            <Row className="justify-content-center g-4">
                <Col xs={12} md={12} className="text-center p-4">
                    <Card className="portfolio-title">
                        <div className="font-loader">My Portfolio</div>
                    </Card>
                </Col>
            </Row>
            <Row>
                {imageArray.map((image, index) => (
                    <Row className="mb-4" key={image}>
                        <Col className="col-12" key={index}>
                            <PortfolioWrapper path={image} />
                        </Col>
                    </Row>
                ))}
            </Row>
        </Container>
    );
};

export default Portfolio;
