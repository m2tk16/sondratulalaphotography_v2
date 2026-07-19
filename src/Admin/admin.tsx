import { useEffect, useMemo, useState, type FormEvent } from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import { Eye, EyeSlash, Trash, Upload } from "react-bootstrap-icons";
import GetImage from "../Utilities/getImage";
import {
  loadPhotos,
  PHOTO_CATEGORIES,
  safeFileName,
  type Photo,
} from "../Portfolio/photoData";
import { PUBLIC_API_URL } from "../config/backend";
import "./admin.css";

const adminRequest = async <T,>(
  path: string,
  method: "POST" | "PUT" | "DELETE",
  body: unknown,
): Promise<T> => {
  const session = await fetchAuthSession();
  const idToken = session.tokens?.idToken?.toString();
  if (!idToken) {
    throw new Error("An authenticated session is required.");
  }
  const response = await fetch(`${PUBLIC_API_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Admin request failed with status ${response.status}.`);
  }
  return response.json() as Promise<T>;
};

const EMPTY_FORM = {
  title: "",
  description: "",
  category: PHOTO_CATEGORIES[0],
  location: "",
  capturedAt: "",
  featured: false,
};

const Admin = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Photo | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const sortedPhotos = useMemo(
    () => [...photos].sort((a, b) => a.order - b.order),
    [photos],
  );

  useEffect(() => {
    loadPhotos()
      .then(setPhotos)
      .catch(() => setError("Could not load the photograph library."))
      .finally(() => setLoading(false));
  }, []);

  const persist = async (nextPhotos: Photo[], successMessage: string) => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await adminRequest("/admin/manifest", "PUT", { photos: nextPhotos });
      setPhotos(nextPhotos);
      setMessage(successMessage);
    } catch {
      setError(
        "The change was not saved. Please sign in again and retry.",
      );
      throw new Error("Unable to save photo manifest.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (event: FormEvent) => {
    event.preventDefault();
    if (!file || !form.title.trim()) {
      setError("Choose an image and give it a title.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");
    const filename = `${Date.now()}-${safeFileName(file.name)}`;
    let uploadedPath = "";
    try {
      const upload = await adminRequest<{ path: string; uploadUrl: string }>(
        "/admin/upload-url",
        "POST",
        { filename, contentType: file.type || "image/jpeg" },
      );
      uploadedPath = upload.path;
      const uploadResponse = await fetch(upload.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "image/jpeg" },
        body: file,
      });
      if (!uploadResponse.ok) {
        throw new Error("Image upload failed.");
      }

      const nextPhoto: Photo = {
        id: crypto.randomUUID(),
        path: upload.path,
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        location: form.location.trim(),
        capturedAt: form.capturedAt,
        active: true,
        featured: form.featured,
        order: photos.length,
      };
      const nextPhotos = [...photos, nextPhoto];
      await adminRequest("/admin/manifest", "PUT", { photos: nextPhotos });
      setPhotos(nextPhotos);
      setForm(EMPTY_FORM);
      setFile(null);
      const input = document.getElementById("photo-file") as HTMLInputElement | null;
      if (input) input.value = "";
      setMessage(`“${nextPhoto.title}” is now in the portfolio.`);
    } catch {
      if (uploadedPath) {
        try {
          await adminRequest("/admin/photo", "DELETE", {
            path: uploadedPath,
            photos,
          });
        } catch {
          // The admin can retry cleanup from the AWS console if both requests fail.
        }
      }
      setError(
        "The photograph could not be uploaded. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (photo: Photo) => {
    const nextPhotos = photos.map((item) =>
      item.id === photo.id ? { ...item, active: !item.active } : item,
    );
    try {
      await persist(
        nextPhotos,
        photo.active
          ? `“${photo.title}” is hidden from the public gallery.`
          : `“${photo.title}” is visible again.`,
      );
    } catch {
      // persist already exposes a useful message.
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || deleteConfirmation !== "DELETE") return;
    setSaving(true);
    setError("");
    try {
      const nextPhotos = photos.filter((photo) => photo.id !== deleteTarget.id);
      await adminRequest("/admin/photo", "DELETE", {
        path: deleteTarget.path,
        photos: nextPhotos,
      });
      setPhotos(nextPhotos);
      setMessage(`“${deleteTarget.title}” was permanently deleted.`);
      setDeleteTarget(null);
      setDeleteConfirmation("");
    } catch {
      setError("The photograph could not be deleted. No gallery record was changed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page">
      <header className="page-intro admin-intro">
        <p className="eyebrow">Private studio</p>
        <h1>Portfolio manager</h1>
        <p>Upload new work and decide what visitors can see.</p>
      </header>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <p className="eyebrow">New photograph</p>
            <h2>Add to the collection</h2>
          </div>
          <Upload aria-hidden />
        </div>
        <form className="upload-form" onSubmit={handleUpload}>
          <label className="file-drop" htmlFor="photo-file">
            <span>{file ? file.name : "Choose a JPG, PNG, WebP, or AVIF image"}</span>
            <input
              accept="image/avif,image/jpeg,image/png,image/webp"
              id="photo-file"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              required
              type="file"
            />
          </label>
          <label>
            Title
            <input
              maxLength={100}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder="Into the fog"
              required
              value={form.title}
            />
          </label>
          <label>
            Category
            <select
              onChange={(event) => setForm({ ...form, category: event.target.value as typeof form.category })}
              value={form.category}
            >
              {PHOTO_CATEGORIES.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>
          <label>
            Location
            <input
              maxLength={100}
              onChange={(event) => setForm({ ...form, location: event.target.value })}
              placeholder="Great Smoky Mountains, TN"
              value={form.location}
            />
          </label>
          <label>
            Date captured
            <input
              onChange={(event) => setForm({ ...form, capturedAt: event.target.value })}
              type="date"
              value={form.capturedAt}
            />
          </label>
          <label className="full-width">
            Description
            <textarea
              maxLength={500}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder="A short story about this photograph…"
              rows={4}
              value={form.description}
            />
          </label>
          <label className="check-label full-width">
            <input
              checked={form.featured}
              onChange={(event) => setForm({ ...form, featured: event.target.checked })}
              type="checkbox"
            />
            Feature this photograph
          </label>
          <button className="primary-button" disabled={saving} type="submit">
            {saving ? "Uploading…" : "Upload photograph"}
          </button>
        </form>
      </section>

      {(message || error) && (
        <div className={`admin-notice ${error ? "error" : ""}`} role="status">
          {error || message}
        </div>
      )}

      <section className="admin-library">
        <div className="admin-section-heading">
          <div>
            <p className="eyebrow">Current collection</p>
            <h2>{photos.length} photographs</h2>
          </div>
        </div>
        {loading && <div className="gallery-message">Loading the studio…</div>}
        <div className="admin-photo-list">
          {sortedPhotos.map((photo) => (
            <article className="admin-photo-row" key={photo.id}>
              <GetImage imagePath={photo.path} className="admin-thumbnail" />
              <div className="admin-photo-copy">
                <span>{photo.category}</span>
                <h3>{photo.title}</h3>
                <p>{photo.active ? "Visible in portfolio" : "Hidden from portfolio"}</p>
              </div>
              <div className="admin-actions">
                <button
                  disabled={saving}
                  onClick={() => void toggleActive(photo)}
                  type="button"
                >
                  {photo.active ? <EyeSlash aria-hidden /> : <Eye aria-hidden />}
                  {photo.active ? "Deactivate" : "Reactivate"}
                </button>
                <button
                  className="danger-action"
                  disabled={saving}
                  onClick={() => {
                    setDeleteTarget(photo);
                    setDeleteConfirmation("");
                  }}
                  type="button"
                >
                  <Trash aria-hidden />
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {deleteTarget && (
        <div className="dialog-backdrop" role="presentation">
          <section
            aria-describedby="delete-description"
            aria-labelledby="delete-title"
            aria-modal="true"
            className="confirm-dialog"
            role="dialog"
          >
            <p className="eyebrow">Permanent action</p>
            <h2 id="delete-title">Delete “{deleteTarget.title}”?</h2>
            <p id="delete-description">
              This removes both the original file and its portfolio information.
              It cannot be undone. Type <strong>DELETE</strong> to confirm.
            </p>
            <input
              aria-label="Type DELETE to confirm"
              autoFocus
              onChange={(event) => setDeleteConfirmation(event.target.value)}
              value={deleteConfirmation}
            />
            <div className="dialog-actions">
              <button
                onClick={() => {
                  setDeleteTarget(null);
                  setDeleteConfirmation("");
                }}
                type="button"
              >
                Keep photograph
              </button>
              <button
                className="danger-button"
                disabled={deleteConfirmation !== "DELETE" || saving}
                onClick={() => void confirmDelete()}
                type="button"
              >
                Permanently delete
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default Admin;
