import express from "express";
import db from "../database.js";
import auth from "../middleware/auth.js";

const reviewsRouter = express.Router();

reviewsRouter.get("/movie/:movieId", async (req, res) => {
  const { movieId } = req.params;

  try {
    const result = await db.query(
      `SELECT r.id,
              r.rating,
              r.title,
              r.body,
              r.created_at,
              a.email AS author
       FROM reviews r
       JOIN account a ON a.id = r.user_id
       WHERE r.movie_id = $1
       ORDER BY r.created_at DESC`,
      [movieId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("ERROR fetching reviews:", err);
    res.status(500).json({ error: "Server error" });
  }
});

reviewsRouter.post("/movie/:movieId", auth, async (req, res) => {
  const { movieId } = req.params;
  const { rating, title, body } = req.body;
  const userId = req.user.id;

  try {
    const result = await db.query(
      `INSERT INTO reviews (movie_id, user_id, rating, title, body)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (movie_id, user_id)
       DO UPDATE SET rating = EXCLUDED.rating,
                     title  = EXCLUDED.title,
                     body   = EXCLUDED.body,
                     updated_at = NOW()
       RETURNING *`,
      [movieId, userId, rating, title, body]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("ERROR saving review:", err);
    res.status(500).json({ error: "Server error" });
  }
});

reviewsRouter.get("/:reviewId/comments", async (req, res) => {
  const { reviewId } = req.params;

  try {
    const result = await db.query(
      `SELECT c.id,
              c.body,
              c.created_at,
              a.email AS author
       FROM comments c
       JOIN account a ON a.id = c.user_id
       WHERE c.review_id = $1
       ORDER BY c.created_at ASC`,
      [reviewId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("ERROR fetching comments:", err);
    res.status(500).json({ error: "Server error" });
  }
});

reviewsRouter.post("/:reviewId/comments", auth, async (req, res) => {
  const { reviewId } = req.params;
  const { body } = req.body;
  const userId = req.user.id;

  try {
    const result = await db.query(
      `INSERT INTO comments (review_id, user_id, body)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [reviewId, userId, body]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("ERROR saving comment:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default reviewsRouter;
