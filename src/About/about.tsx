import GetImage from "../Utilities/getImage";
import "./about.css";

const About = () => (
  <div className="about-page">
    <header className="page-intro">
      <p className="eyebrow">Behind the lens</p>
      <h1>Finding wonder in familiar places.</h1>
    </header>
    <section className="about-story">
      <div className="about-image-wrap">
        <GetImage
          imagePath="public/images/about/deserted.webp"
          className="about-image"
        />
      </div>
      <div className="about-copy">
        <p className="eyebrow">Hello, I’m Sondra</p>
        <h2>Photography helps me slow down and truly see.</h2>
        <p>
          What began as a creative outlet quickly became a way to notice the
          changing light, peaceful vistas, and small details that make everyday
          life beautiful. Classes gave me a foundation, but curiosity continues
          to be my favorite teacher.
        </p>
        <p>
          My husband Martin, our Labrador Loki, and I now call Tennessee home.
          Before moving south, the landscapes of New Jersey and New York first
          inspired me to carry a camera. Those places—and the calm of a foggy
          morning—still shape the way I see.
        </p>
        <p>
          This collection includes landscapes, still life, and the occasional
          joyful appearance from Loki. I hope each photograph offers a small
          pause and a reason to smile.
        </p>
      </div>
    </section>
  </div>
);

export default About;
