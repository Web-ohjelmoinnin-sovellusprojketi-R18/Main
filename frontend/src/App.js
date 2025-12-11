import { useState, useEffect } from "react";

function App() {
    const [name, setName] = useState("");
    const [genre, setGenre] = useState("");
    const [year, setYear] = useState("");
    const [results, setResults] = useState([]);
    const [nowPlaying, setNowPlaying] = useState([]);
    const [userId, setUserId] = useState(1); // Simulated logged-in user
    const [favorites, setFavorites] = useState([]);
    const [viewingPublicFavorites, setViewingPublicFavorites] = useState(false);
    const [publicFavoritesData, setPublicFavoritesData] = useState(null);
    const [publicUserId, setPublicUserId] = useState("");

    // Check if viewing a public favorites list from URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const favUserId = params.get("favorites");
        if (favUserId) {
            setPublicUserId(favUserId);
            fetchPublicFavorites(favUserId);
        }
    }, []);

    const searchMovies = async () => {
        const res = await fetch(
            `/api/movies/search?name=${name}&genre=${genre}&year=${year}`
        );
        const data = await res.json();
        setResults(data.results || []);
    };

    const fetchNowPlaying = async () => {
        const res = await fetch(`/api/movies/now-playing`);
        const data = await res.json();
        setNowPlaying(data.results || []);
    };

    const fetchMyFavorites = async () => {
        const res = await fetch(`/api/favorites?userId=${userId}`);
        const data = await res.json();
        setFavorites(data.favorites || []);
        setViewingPublicFavorites(false);
    };

    const fetchPublicFavorites = async (uid) => {
        try {
            const res = await fetch(`/api/favorites/public/${uid}`);
            const data = await res.json();
            setPublicFavoritesData(data);
            setViewingPublicFavorites(true);
        } catch (err) {
            console.error("Failed to fetch public favorites:", err);
            alert("Käyttäjää ei löytynyt");
        }
    };

    const addToFavorites = async (movie) => {
        try {
            const res = await fetch(`/api/favorites`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    tmdbId: movie.id,
                    title: movie.title,
                    posterUrl: movie.poster_path
                        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                        : null,
                    releaseDate: movie.release_date,
                    overview: movie.overview,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                alert("Elokuva lisätty suosikkeihin!");
                fetchMyFavorites();
            } else {
                alert(data.error || "Virhe lisättäessä suosikkiin");
            }
        } catch (err) {
            console.error("Error adding to favorites:", err);
            alert("Virhe lisättäessä suosikkiin");
        }
    };

    const removeFromFavorites = async (movieId) => {
        try {
            const res = await fetch(`/api/favorites/${movieId}?userId=${userId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                alert("Elokuva poistettu suosikeista!");
                fetchMyFavorites();
            }
        } catch (err) {
            console.error("Error removing from favorites:", err);
        }
    };

    const generateShareableUrl = () => {
        const url = `${window.location.origin}${window.location.pathname}?favorites=${userId}`;
        return url;
    };

    const copyShareableUrl = () => {
        const url = generateShareableUrl();
        navigator.clipboard.writeText(url);
        alert("Jaettava linkki kopioitu leikepöydälle!");
    };

    const viewPublicFavoritesById = () => {
        if (publicUserId) {
            fetchPublicFavorites(publicUserId);
        }
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Arial" }}>
            <h1>Elokuvasovellus</h1>

            <div style={{ marginBottom: "20px", padding: "10px", backgroundColor: "#f0f0f0" }}>
                <p>Kirjautuneena käyttäjänä: <strong>User {userId}</strong></p>
                <label>
                    Vaihda käyttäjä (simulointi):{" "}
                    <input
                        type="number"
                        value={userId}
                        onChange={(e) => setUserId(parseInt(e.target.value) || 1)}
                        style={{ width: "60px" }}
                    />
                </label>
            </div>

            {/* HAKU */}
            <h2>Haku</h2>
            <input
                placeholder="Nimi"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <input
                placeholder="Genre"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
            />
            <input
                placeholder="Julkaisuvuosi"
                value={year}
                onChange={(e) => setYear(e.target.value)}
            />
            <button onClick={searchMovies}>Hae</button>

            <div>
                {results.map((m) => (
                    <div key={m.id} style={{ marginBottom: "10px", border: "1px solid #ccc", padding: "10px" }}>
                        <h3>{m.title}</h3>
                        <p>{m.release_date}</p>
                        <button onClick={() => addToFavorites(m)}>Lisää suosikkeihin</button>
                    </div>
                ))}
            </div>

            <hr />

            {/* NYT ELOKUVISSA */}
            <h2>Nyt elokuvissa Suomessa</h2>
            <button onClick={fetchNowPlaying}>Hae elokuvat</button>

            <div>
                {nowPlaying.map((m) => (
                    <div key={m.id} style={{ marginBottom: "10px", border: "1px solid #ccc", padding: "10px" }}>
                        <h3>{m.title}</h3>
                        <p>Ensi-ilta: {m.release_date}</p>
                        <button onClick={() => addToFavorites(m)}>Lisää suosikkeihin</button>
                    </div>
                ))}
            </div>

            <hr />

            {/* OMAT SUOSIKIT */}
            <h2>Omat suosikkini</h2>
            <button onClick={fetchMyFavorites}>Näytä omat suosikit</button>
            {!viewingPublicFavorites && favorites.length > 0 && (
                <div>
                    <button onClick={copyShareableUrl} style={{ marginLeft: "10px" }}>
                        Kopioi jaettava linkki
                    </button>
                    <p style={{ fontSize: "12px", color: "#666" }}>
                        Jaettava linkki: {generateShareableUrl()}
                    </p>
                </div>
            )}

            {!viewingPublicFavorites && favorites.length > 0 && (
                <div>
                    {favorites.map((fav) => (
                        <div key={fav.id} style={{ marginBottom: "10px", border: "1px solid #ccc", padding: "10px" }}>
                            <h3>{fav.title}</h3>
                            <p>{fav.release_date}</p>
                            <button onClick={() => removeFromFavorites(fav.movie_id)}>
                                Poista suosikeista
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {!viewingPublicFavorites && favorites.length === 0 && (
                <p>Ei suosikkeja vielä.</p>
            )}

            <hr />

            {/* JULKINEN SUOSIKKILISTA */}
            <h2>Näytä käyttäjän suosikkilista</h2>
            <div>
                <input
                    type="number"
                    placeholder="Käyttäjän ID"
                    value={publicUserId}
                    onChange={(e) => setPublicUserId(e.target.value)}
                    style={{ marginRight: "10px" }}
                />
                <button onClick={viewPublicFavoritesById}>Näytä suosikit</button>
            </div>

            {viewingPublicFavorites && publicFavoritesData && (
                <div style={{ marginTop: "20px" }}>
                    <h3>
                        Käyttäjän {publicFavoritesData.username} suosikit
                    </h3>
                    {publicFavoritesData.favorites.length === 0 ? (
                        <p>Ei suosikkeja vielä.</p>
                    ) : (
                        publicFavoritesData.favorites.map((movie) => (
                            <div
                                key={movie.tmdb_id}
                                style={{ marginBottom: "10px", border: "1px solid #ccc", padding: "10px" }}
                            >
                                <h4>{movie.title}</h4>
                                <p>{movie.release_date}</p>
                            </div>
                        ))
                    )}
                    <button onClick={() => setViewingPublicFavorites(false)}>
                        Takaisin
                    </button>
                </div>
            )}
        </div>
    );
}

export default App;
