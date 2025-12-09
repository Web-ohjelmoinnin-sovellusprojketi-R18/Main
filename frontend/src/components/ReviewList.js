import { useEffect, useState } from "react";

function Comments({ reviewId }) {
  const [comments, setComments] = useState([]);
  const [newBody, setNewBody] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const loadComments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reviews/${reviewId}/comments`);
      if (!res.ok) throw new Error("Haku epäonnistui");
      const data = await res.json();
      setComments(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [reviewId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newBody.trim()) return;

    if (!token) {
      alert("Kirjaudu sisään kommentoidaksesi.");
      return;
    }

    try {
      const res = await fetch(`/api/reviews/${reviewId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ body: newBody }),
      });

      if (!res.ok) throw new Error("Kommentin tallennus epäonnistui");

      setNewBody("");
      await loadComments();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ marginTop: 8, marginLeft: 16 }}>
      <strong>Kommentit</strong>
      {loading && <div>Ladataan kommentteja...</div>}
      {!loading && comments.length === 0 && (
        <div style={{ fontSize: 14 }}>Ei kommentteja vielä.</div>
      )}

      {comments.map((c) => (
        <div
          key={c.id}
          style={{
            borderTop: "1px solid #eee",
            paddingTop: 4,
            marginTop: 4,
            fontSize: 14,
          }}
        >
          <div>{c.body}</div>
          <small>
            {c.author}
            {c.created_at &&
              " · " + new Date(c.created_at).toLocaleDateString("fi-FI")}
          </small>
        </div>
      ))}

      <form onSubmit={handleAddComment} style={{ marginTop: 8 }}>
        <input
          style={{ width: "100%", padding: 6, fontSize: 14 }}
          placeholder="Lisää kommentti..."
          value={newBody}
          onChange={(e) => setNewBody(e.target.value)}
        />
      </form>
    </div>
  );
}

export default function ReviewList({ reviews }) {
  if (!reviews || reviews.length === 0) {
    return <div>Ei vielä arvosteluja </div>;
  }

  return (
    <div>
      {reviews.map((r) => (
        <div
          key={r.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: 12,
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 18 }}>
            {"★".repeat(r.rating) + "☆".repeat(5 - r.rating)}
          </div>
          {r.title && <h4 style={{ margin: "4px 0" }}>{r.title}</h4>}
          <p style={{ margin: "4px 0" }}>{r.body}</p>
          <small>
            {r.author}
            {r.created_at &&
              " · " + new Date(r.created_at).toLocaleDateString("fi-FI")}
          </small>
          <Comments reviewId={r.id} />
        </div>
      ))}
    </div>
  );
}
