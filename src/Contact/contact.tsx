import { useState, type FormEvent } from "react";
import { PUBLIC_API_URL } from "../config/backend";
import "./contact.css";

const CONTACT_API = `${PUBLIC_API_URL}/contact/send-email`;

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus("");
    setIsError(false);
    try {
      const response = await fetch(CONTACT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Request failed.");
      setStatus("Thank you—your message is on its way to Sondra.");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch {
      setIsError(true);
      setStatus("Your message could not be sent. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const update = (field: keyof typeof formData, value: string) =>
    setFormData((current) => ({ ...current, [field]: value }));

  return (
    <div className="contact-page">
      <header className="page-intro">
        <p className="eyebrow">Get in touch</p>
        <h1>Let’s start a conversation.</h1>
        <p>
          Ask about a photograph, share a thought, or simply say hello. Sondra
          would love to hear from you.
        </p>
      </header>
      <form className="contact-form" onSubmit={handleSubmit}>
        <label>
          First name
          <input
            autoComplete="given-name"
            onChange={(event) => update("firstName", event.target.value)}
            required
            value={formData.firstName}
          />
        </label>
        <label>
          Last name
          <input
            autoComplete="family-name"
            onChange={(event) => update("lastName", event.target.value)}
            value={formData.lastName}
          />
        </label>
        <label className="full-field">
          Email
          <input
            autoComplete="email"
            onChange={(event) => update("email", event.target.value)}
            required
            type="email"
            value={formData.email}
          />
        </label>
        <label className="full-field">
          Subject
          <input
            onChange={(event) => update("subject", event.target.value)}
            required
            value={formData.subject}
          />
        </label>
        <label className="full-field">
          Message
          <textarea
            onChange={(event) => update("message", event.target.value)}
            required
            rows={7}
            value={formData.message}
          />
        </label>
        <button className="primary-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Sending…" : "Send message"}
        </button>
        {status && (
          <p className={`form-status ${isError ? "error" : ""}`} role="status">
            {status}
          </p>
        )}
      </form>
    </div>
  );
};

export default Contact;
