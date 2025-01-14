import "./about.css";
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Card from 'react-bootstrap/Card';
import GetImage from "../Utilities/getImage";

const About = () => {
    const isVisible = true;
    return (
        <>
            <Row className="justify-content-center g-4">
                <Col xs={12} md={12} className="text-center p-4">
                    <Card className="about-me-title">
                        <div className="font-loader">Behind the Lens: My Story</div>
                    </Card>
                </Col>
            </Row>
            <Row className="justify-content-center g-4">
                <Col xs={12} md={6} className="text-center p-4">
                    <Card className="about-me-card">
                        <Card.Body>
                            Hi there! Welcome to my photography website! My name is Alessandra, and I am so excited to share my pictures with you. 
                            Photography is a hobby that makes me really happy, and this website is a way for me to show my work and connect with 
                            people who also enjoy beautiful moments. My gallery has photos of landscapes, still-life scenes, and even some fun 
                            pictures of my Labrador, Loki.

                            I started taking photos because I wanted to do something creative outside of work. After taking a few classes and 
                            practicing on my own, I’ve found that photography helps me slow down and enjoy the little details in life. I’m 
                            still learning and getting better at it, but I love every step of the journey. Each picture I take is special to 
                            me, and I hope you’ll enjoy seeing my progress.<br></br><br></br>

                            My husband Martin and I, along with our dog Loki, currently live in Tennessee. Before this, we were originally 
                            from the New Jersey (NJ) and New York (NY) area, where the views inspired me to start taking pictures. The natural 
                            beauty of those states drove my interest in photography, and I’ve been capturing moments ever since. Now, I’m 
                            continuing to grow my skills while living in Tennessee, focusing on peaceful vistas and unique close-ups of everyday 
                            moments. Whether it’s a foggy morning or Loki being silly, I try to capture scenes that bring smiles or a 
                            sense of calm.<br></br><br></br>

                            Thanks so much for visiting my website and looking at my photos. I hope you like what you see and can feel the 
                            happiness I find in photography. If you want to share your thoughts or just say hi, feel free to reach out through 
                            my contact page. Let’s celebrate life’s beauty together!
                            </Card.Body>
                    </Card>
                </Col>
                
                <Col xs={12} md={6} className="text-center p-4">
                    <Card className="about-me-card">
                        <Card.Body>
                            <GetImage
                                imagePath="public/images/about/deserted.webp"
                                className={`home-image ${isVisible ? "visible" : ""}`}
                            />
                    </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    )
}

export default About;
