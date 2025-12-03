import { useState } from "react";

export default function Movies() {
  const [name, setName] = useState("");
  const [genre, setGenre] = useState("");
  const [year, setYear] = useState("");
  const [results, setResults] = useState([]);
  const [nowPlaying, setNowPlaying] = useState([]);

  const searchMovies = async () => {
    const res = await fetch(`/api/movies/search?name=${name}&genre=${genre}&year=${year}`);
    setResults((await res.json()).results || []);
  };

  const fetchNowPlaying = async () => {
    const res = await fetch(`/api/movies/now-playing`);
    setNowPlaying((await res.json()).results || []);
  };

  return (
    <>
      <h2>Haku</h2>
      <input placeholder="Nimi" value={name} onChange={e => setName(e.target.value)} />
      <input placeholder="Genre" value={genre} onChange={e => setGenre(e.target.value)} />
      <input placeholder="Julkaisuvuosi" value={year} onChange={e => setYear(e.target.value)} />
      <button onClick={searchMovies}>Hae</button>

      {results.map(m => <p key={m.id}>{m.title}</p>)}

      <h2>Nyt elokuvissa Suomessa</h2>
      <button onClick={fetchNowPlaying}>Hae elokuvat</button>

      {nowPlaying.map(m => <p key={m.id}>{m.title}</p>)}

      <hr />
    </>
  );
}
