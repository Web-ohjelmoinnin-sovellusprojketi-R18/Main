import { Router } from "express";
import axios from "axios";

const GENRES = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  fantasy: 14,
  history: 36,
  horror: 27,
  music: 10402,
  mystery: 9648,
  romance: 10749,
  "science fiction": 878,
  scifi: 878,
  thriller: 53,
  war: 10752,
  western: 37,
};

const router = Router();
const TMDB_KEY = process.env.TMDB_API_KEY;

router.get("/search", async (req, res) => {
    const { name, genre, year } = req.query;

    let genreId = null;
    if (genre) {
        const key = genre.toLowerCase().trim();
        genreId = GENRES[key] || null;
    }

    try {
    let url = "";
    let params = { api_key: TMDB_KEY};

    if (name) {
      url = "https://api.themoviedb.org/3/search/movie";
      params.query = name;

      if (year) {
        params.primary_release_year = year;
      }

    } 
    else {
      url = "https://api.themoviedb.org/3/discover/movie";

      if (genreId) {
        params.with_genres = genreId;
      }

      if (year) {
        params.primary_release_year = year;
      }
    }

    const response = await axios.get(url, { params });
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
