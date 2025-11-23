import { Router } from "express";
import axios from "axios";

const router = Router();
const TMDB_KEY = process.env.TMDB_API_KEY;

router.get("/search", async (req, res) => {
    const { name, genre, year } = req.query;

    try {
        const response = await axios.get(
            "https://api.themoviedb.org/3/search/movie",
            {
                params: {
                    api_key: TMDB_KEY,
                    query: name,
                    primary_release_year: year,
                    with_genres: genre
                }
            }
        );
        res.json(response.data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Search failed" });
    }
});

router.get("/now-playing", async (req, res) => {
    try {
        const response = await axios.get(
            "https://api.themoviedb.org/3/movie/now_playing",
            {
                params: {
                    api_key: TMDB_KEY,
                    region: "FI",
                    language: "fi-FI"
                }
            }
        );
        res.json(response.data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch now playing movies" });
    }
});

export default router;
