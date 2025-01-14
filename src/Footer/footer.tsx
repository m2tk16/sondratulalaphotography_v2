import "./footer.css";
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';
import { Envelope, Instagram } from 'react-bootstrap-icons';
import { signInWithRedirect, signOut } from "aws-amplify/auth";
import { Nav } from "react-bootstrap";

const Footer = () => {

    return (
        <Container className="footer-container">
            <hr></hr> 
            <Row>
                <Col xs={{ span: 3, offset: 1 }} className="footer-header footer-link-title">
                    Links
                </Col>
                <Col xs={4} className="footer-header footer-contact-title">
                    Contact
                </Col>
                <Col xs={4} className="footer-header footer-contact-title">
                    Sign In
                </Col>
            </Row>
            <Row>
                <Col xs={{ span: 3, offset: 1 }}>
                    <a className="footer-links" href="/">Home</a>
                </Col>
                <Col xs={4}>
                    <a href="mailto:sondratulalaphotography@gmail.com"><Envelope  style={{ color: "grey" }}/></a>
                </Col>
                <Col xs={4}>
                    <Nav.Link className="nav-link footer-links" onClick={() => signInWithRedirect({ provider: "Google" })}>
                        Sign In
                    </Nav.Link>
                </Col>    
            </Row> 
            <Row>
                <Col xs={{ span: 3, offset: 1 }}>
                    <a className="footer-links" href="/about">About</a>
                </Col>
                <Col xs={4}>
                <a href="instagram://user?username=sondratulalaphotography"><Instagram  style={{ color: "grey" }}/></a>
                </Col>
                <Col xs={4}>
                    <Nav.Link className="nav-link footer-links" onClick={() => signOut()}>Sign Out</Nav.Link>
                </Col>    
            </Row> 
            <Row>
                <Col xs={{ span: 3, offset: 1 }}>
                    <a className="footer-links" href="/portfolio">Portfolio</a>
                </Col>  
                <Col xs={4}>
                    <a className="footer-links" href="/contact">Message</a>
                </Col>  
            </Row>
            <hr></hr>
            <Row>
                <Col xs={12} className="footer-year">Sondra Tulala Photography | 2025</Col>
            </Row>
        </Container>
    )
}

export default Footer;
