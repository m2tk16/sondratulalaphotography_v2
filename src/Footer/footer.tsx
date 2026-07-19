import { Envelope, Instagram } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import "./footer.css";

const Footer = () => (
  <footer className="site-footer">
    <div>
      <p className="footer-mark">Sondra Tulala</p>
      <span>Photography inspired by the beauty in everyday life.</span>
    </div>
    <nav aria-label="Footer navigation">
      <Link to="/portfolio">Portfolio</Link>
      <Link to="/about">About</Link>
      <Link to="/contact">Contact</Link>
    </nav>
    <div className="social-links">
      <a
        aria-label="Email Sondra Tulala Photography"
        href="mailto:sondratulalaphotography@gmail.com"
      >
        <Envelope aria-hidden />
      </a>
      <a
        aria-label="Sondra Tulala Photography on Instagram"
        href="https://www.instagram.com/sondratulalaphotography/"
        rel="noreferrer"
        target="_blank"
      >
        <Instagram aria-hidden />
      </a>
    </div>
    <p className="copyright">
      © {new Date().getFullYear()} Sondra Tulala Photography
    </p>
  </footer>
);

export default Footer;
