import { useState } from "react";

function App() {
    const [name, setName] = useState("");
    const [genre, setGenre] = useState("");
    const [year, setYear] = useState("");
    const [results, setResults] = useState([]);
    const [nowPlaying, setNowPlaying] = useState([]);

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

    return (
        <div style={{ padding: "20px", fontFamily: "Arial" }}>
            <h1>Elokuvasovellus</h1>

            {/* HAKU */}
            <h2>Haku</h2>
            <input
                placeholder="Nimi"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <input
                placeholder="Genre ID"
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
                    <div key={m.id}>
                        <h3>{m.title}</h3>
                        <p>{m.release_date}</p>
                    </div>
                ))}
            </div>

            <hr />

            {/* NYT ELOKUVISSA */}
            <h2>Nyt elokuvissa Suomessa</h2>
            <button onClick={fetchNowPlaying}>Hae elokuvat</button>

            <div>
                {nowPlaying.map((m) => (
                    <div key={m.id}>
                        <h3>{m.title}</h3>
                        <p>Ensi-ilta: {m.release_date}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;
