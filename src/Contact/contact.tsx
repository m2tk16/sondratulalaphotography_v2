import { useState } from "react";
import "./contact.css";
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Toast from 'react-bootstrap/Toast';
import Card from 'react-bootstrap/Card';

const Contact = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        subject: '',
        message: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [responseMessage, setResponseMessage] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastVariant, setToastVariant] = useState('dark');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.preventDefault();
        setIsSubmitting(true);
        setResponseMessage('');
        setShowToast(false);

        try {
            const response = await fetch('https://nlkcug9ut8.execute-api.us-east-1.amazonaws.com/dev/contact/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            await response.json();

            if (response.ok) {
                setToastVariant(toastVariant);
                setResponseMessage('Your message has been sent!');
            } else {
                setToastVariant(toastVariant);
                setResponseMessage('Failed to send your message.');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setToastVariant(toastVariant);
            setResponseMessage('An error occurred. Please try again.');
        } finally {
            setShowToast(true);
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Row className="justify-content-center g-4">
                <Col xs={12} md={12} className="text-center p-4">
                    <Card className="portfolio-title">
                        <div className="font-loader">Contact Me!</div>
                    </Card>
                </Col>
            </Row>
            <Row className="d-flex justify-content-center align-items-center px-5">
                <Col sm={6} md={4} className="text-center mb-4 mt-4">
                    Have a question or just curious about photography tips, my journey, or the options I offer? 
                    I’d love to hear from you! Feel free to send a message, and I’ll get back to you as soon as I can. 
                    Let’s connect and make your photography experience even better!
                </Col>
            </Row>
            <Form onSubmit={handleSubmit}>
                <Row className="px-5">
                    <Col md={12}>
                        <div className="content-wrapper">
                            <Col sm={{ span: 2, offset: 5 }} className="mb-4">
                                <FloatingLabel controlId="firstName" label="First Name">
                                    <Form.Control 
                                        type="text" 
                                        size="sm" 
                                        placeholder="John" 
                                        required 
                                        value={formData.firstName} 
                                        onChange={handleChange} 
                                    />
                                </FloatingLabel>
                            </Col>
                            <Col sm={{ span: 2, offset: 5 }} className="mb-4">
                                <FloatingLabel controlId="lastName" label="Last Name">
                                    <Form.Control 
                                        type="text" 
                                        size="sm" 
                                        placeholder="Doe" 
                                        value={formData.lastName} 
                                        onChange={handleChange} 
                                    />
                                </FloatingLabel>
                            </Col>
                            <Col sm={{ span: 2, offset: 5 }} className="mb-4">
                                <FloatingLabel controlId="email" label="Email address" className="mb-3">
                                    <Form.Control 
                                        type="email" 
                                        placeholder="name@example.com" 
                                        required 
                                        value={formData.email} 
                                        onChange={handleChange} 
                                    />
                                </FloatingLabel>
                            </Col>
                            <Col sm={{ span: 2, offset: 5 }} className="mb-4">
                                <FloatingLabel controlId="subject" label="Subject" className="mb-3">
                                    <Form.Control 
                                        type="text" 
                                        size="sm" 
                                        placeholder="Subject" 
                                        required 
                                        value={formData.subject} 
                                        onChange={handleChange} 
                                    />
                                </FloatingLabel>
                            </Col>
                            <Col sm={{ span: 4, offset: 4 }} className="mb-4">
                                <FloatingLabel controlId="message" label="Message">
                                    <Form.Control
                                        as="textarea"
                                        placeholder="Leave a message here"
                                        style={{ height: '100px', resize: "vertical" }}
                                        size="sm"
                                        required
                                        value={formData.message}
                                        onChange={handleChange}
                                    />
                                </FloatingLabel>
                            </Col>
                            <Col sm={{ span: 4, offset: 4 }} className="mb-4 text-center">
                                <Button variant="outline-secondary" type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Submitting...' : 'Submit'}
                                </Button>
                                <Toast 
                                    className="mt-3 mx-auto"
                                    show={showToast} 
                                    onClose={() => setShowToast(false)} 
                                    bg={toastVariant} 
                                    delay={3000} 
                                    autohide
                                >
                                    <Toast.Header className="d-flex justify-content-between align-items-center">
                                        <strong className="mx-auto">Email Status</strong>
                                    </Toast.Header>
                                    <Toast.Body>{responseMessage}</Toast.Body>
                                </Toast>
                            </Col>
                        </div>
                    </Col>
                </Row>
            </Form>
        </>
    );
};

export default Contact;
