import { useEffect, useState } from "react";
import StarRating from "./StarRating";

export default function ReviewForm({ movieId, existingReview, onSaved }) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setTitle(existingReview.title || "");
      setBody(existingReview.body || "");
    }
  }, [existingReview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Sinun täytyy olla kirjautuneena lähettääksesi arvostelun.");
      return;
    }

    if (!rating) {
      setError("Valitse tähtimäärä.");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch(`/api/reviews/movie/${movieId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating,
          title,
          body,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Tallennus epäonnistui");
      }

      setRating(0);
      setTitle("");
      setBody("");

      const saved = await res.json();
      onSaved && onSaved(saved);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
      <StarRating value={rating} onChange={setRating} />

      <input
        style={{ width: "100%", marginTop: 8, padding: 8 }}
        placeholder="Otsikko (valinnainen)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        style={{ width: "100%", marginTop: 8, padding: 8, minHeight: 80 }}
        placeholder="Kerro mitä pidit elokuvasta..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />

      {error && (
        <div style={{ color: "red", marginTop: 4 }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        style={{ marginTop: 8, padding: "8px 16px" }}
      >
        {saving
          ? "Tallennetaan..."
          : existingReview
          ? "Päivitä arvostelu"
          : "Lähetä arvostelu"}
      </button>
    </form>
  );
}

