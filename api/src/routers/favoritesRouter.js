import { Router } from "express";
import pool from "../database.js";

const router = Router();

// Add a movie to favorites (authenticated users only)
router.post("/", async (req, res) => {
    const { userId, movieId, tmdbId, title, posterUrl, releaseDate, overview } = req.body;

    if (!userId || !tmdbId) {
        return res.status(400).json({ error: "userId and tmdbId are required" });
    }

    try {
        // First, ensure the movie exists in the movies table
        let movieResult = await pool.query(
            "SELECT id FROM movies WHERE tmdb_id = $1",
            [tmdbId]
        );

        let dbMovieId;
        if (movieResult.rows.length === 0) {
            // Insert the movie if it doesn't exist
            const insertMovie = await pool.query(
                "INSERT INTO movies (tmdb_id, title, poster_url, release_date, overview) VALUES ($1, $2, $3, $4, $5) RETURNING id",
                [tmdbId, title || "Unknown", posterUrl || null, releaseDate || null, overview || null]
            );
            dbMovieId = insertMovie.rows[0].id;
        } else {
            dbMovieId = movieResult.rows[0].id;
        }

        // Add to favorites (will fail if already exists due to UNIQUE constraint)
        const result = await pool.query(
            "INSERT INTO favorites (user_id, movie_id) VALUES ($1, $2) RETURNING id, created_at",
            [userId, dbMovieId]
        );

        res.status(201).json({
            success: true,
            favorite: result.rows[0]
        });
    } catch (err) {
        console.error("Error adding favorite:", err);
        if (err.code === "23505") { // Unique constraint violation
            return res.status(409).json({ error: "Movie already in favorites" });
        }
        res.status(500).json({ error: "Failed to add favorite" });
    }
});

// Remove a movie from favorites (authenticated users only)
router.delete("/:movieId", async (req, res) => {
    const { movieId } = req.params;
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ error: "userId is required" });
    }

    try {
        const result = await pool.query(
            "DELETE FROM favorites WHERE user_id = $1 AND movie_id = $2 RETURNING id",
            [userId, movieId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Favorite not found" });
        }

        res.json({ success: true, message: "Favorite removed" });
    } catch (err) {
        console.error("Error removing favorite:", err);
        res.status(500).json({ error: "Failed to remove favorite" });
    }
});

// Get current user's favorites (authenticated users only)
router.get("/", async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ error: "userId is required" });
    }

    try {
        const result = await pool.query(
            `SELECT f.id, f.created_at, m.id as movie_id, m.tmdb_id, m.title, m.poster_url, m.release_date, m.overview
             FROM favorites f
             JOIN movies m ON f.movie_id = m.id
             WHERE f.user_id = $1
             ORDER BY f.created_at DESC`,
            [userId]
        );

        res.json({ favorites: result.rows });
    } catch (err) {
        console.error("Error fetching favorites:", err);
        res.status(500).json({ error: "Failed to fetch favorites" });
    }
});

// Get public favorites list by user ID (accessible to everyone)
router.get("/public/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
        // Get username
        const userResult = await pool.query(
            "SELECT username FROM users WHERE id = $1",
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const username = userResult.rows[0].username;

        // Get user's favorites
        const favoritesResult = await pool.query(
            `SELECT m.tmdb_id, m.title, m.poster_url, m.release_date, m.overview
             FROM favorites f
             JOIN movies m ON f.movie_id = m.id
             WHERE f.user_id = $1
             ORDER BY f.created_at DESC`,
            [userId]
        );

        res.json({
            username,
            userId: parseInt(userId),
            favorites: favoritesResult.rows
        });
    } catch (err) {
        console.error("Error fetching public favorites:", err);
        res.status(500).json({ error: "Failed to fetch favorites" });
    }
});

export default router;
