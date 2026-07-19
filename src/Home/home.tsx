import { ArrowRight } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import GetImage from "../Utilities/getImage";
import "./home.css";

const Home = () => (
  <div className="home-page">
    <section className="hero">
      <GetImage
        imagePath="public/images/home/into_the_fog.webp"
        className="hero-image"
      />
      <div className="hero-shade" />
      <div className="hero-copy">
        <p className="eyebrow">Tennessee · New York · New Jersey</p>
        <h1>Beauty lives<br />in the quiet moments.</h1>
        <p>
          Fine art photography shaped by changing light, open landscapes, and
          the details we almost miss.
        </p>
        <Link className="hero-link" to="/portfolio">
          Explore the portfolio <ArrowRight aria-hidden />
        </Link>
      </div>
      <span className="hero-caption">Into the Fog</span>
    </section>

    <section className="home-statement">
      <p className="eyebrow">Through Sondra’s lens</p>
      <h2>Photographs that ask you to pause.</h2>
      <p>
        From mist-covered vistas to familiar details seen in a new way, each
        image is an invitation to slow down and notice what is already there.
      </p>
      <Link className="text-link" to="/about">
        Meet the photographer <ArrowRight aria-hidden />
      </Link>
    </section>

    <section className="collection-preview">
      <div>
        <span>01</span>
        <h3>Landscapes</h3>
        <p>Atmosphere, scale, and the poetry of changing weather.</p>
      </div>
      <div>
        <span>02</span>
        <h3>Quiet details</h3>
        <p>Small discoveries, held still long enough to be remembered.</p>
      </div>
      <div>
        <span>03</span>
        <h3>Wild at heart</h3>
        <p>Unscripted moments from the animals who share the journey.</p>
      </div>
    </section>
  </div>
);

export default Home;
