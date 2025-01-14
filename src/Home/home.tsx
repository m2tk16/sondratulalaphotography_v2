import "./home.css";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import GetImage from "../Utilities/getImage";

const Home = () => {
  const isVisible = true;

  return (
    <Container className="home-wrapper">
      <Row>
        <Col sm={12}>
          <GetImage
            imagePath="public/images/home/into_the_fog.webp"
            className={`home-image ${isVisible ? "visible" : ""}`}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
