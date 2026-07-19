import { useEffect, useMemo, useState } from "react";
import "./portfolio.css";
import PortfolioWrapper from "./portfolioWrapper";
import { loadPhotos, type Photo } from "./photoData";

const Portfolio = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPhotos()
      .then(setPhotos)
      .catch(() => setError("The gallery could not be loaded. Please try again shortly."))
      .finally(() => setLoading(false));
  }, []);

  const activePhotos = useMemo(
    () => photos.filter((photo) => photo.active),
    [photos],
  );
  const categories = useMemo(
    () => [
      "All",
      ...Array.from(new Set(activePhotos.map((photo) => photo.category))).sort(),
    ],
    [activePhotos],
  );
  const visiblePhotos =
    category === "All"
      ? activePhotos
      : activePhotos.filter((photo) => photo.category === category);

  return (
    <div className="portfolio-page">
      <header className="page-intro">
        <p className="eyebrow">Selected work</p>
        <h1>Stories found in stillness.</h1>
        <p>
          Landscapes, quiet details, and fleeting moments photographed by
          Sondra Tulala.
        </p>
      </header>

      {!loading && !error && categories.length > 2 && (
        <nav className="category-filter" aria-label="Filter photographs">
          {categories.map((item) => (
            <button
              className={category === item ? "active" : ""}
              key={item}
              onClick={() => setCategory(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </nav>
      )}

      {loading && <div className="gallery-message">Gathering the collection…</div>}
      {error && <div className="gallery-message error-message">{error}</div>}
      {!loading && !error && visiblePhotos.length === 0 && (
        <div className="gallery-message">No photographs in this collection yet.</div>
      )}

      <section className="photo-grid" aria-live="polite">
        {visiblePhotos.map((photo) => (
          <PortfolioWrapper key={photo.id} photo={photo} />
        ))}
      </section>
    </div>
  );
};

export default Portfolio;
