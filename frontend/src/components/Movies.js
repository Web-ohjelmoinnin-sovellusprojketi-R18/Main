import { useState } from "react";
import ReviewForm from "./ReviewForm";
import ReviewList from "./ReviewList";

export default function Movies() {
  const [name, setName] = useState("");
  const [genre, setGenre] = useState("");
  const [year, setYear] = useState("");
  const [results, setResults] = useState([]);
  const [nowPlaying, setNowPlaying] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [reviewsRefresh, setReviewsRefresh] = useState(0);

  const searchMovies = async () => {
    const res = await fetch(
      `/api/movies/search?name=${name}&genre=${genre}&year=${year}`
    );
    const data = await res.json();
    setResults(data.results || []);

  const searchMovies = async () => {
    const res = await fetch(`/api/movies/search?name=${name}&genre=${genre}&year=${year}`);
    setResults((await res.json()).results || []);
  };

  const fetchNowPlaying = async () => {
    const res = await fetch(`/api/movies/now-playing`);
    const data = await res.json();
    setNowPlaying(data.results || []);
  };

  const openReviews = (movie) => {
    setSelectedMovie(movie);
    setReviewsRefresh((p) => p + 1);
    setNowPlaying((await res.json()).results || []);
  };

  return (
    <>
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

      {results.map((m) => (
        <div key={m.id} style={{ marginBottom: 8 }}>
          <p style={{ margin: 0 }}>{m.title}</p>
          <button onClick={() => openReviews(m)}>
            Näytä arvostelut & kommentit
          </button>
        </div>
      ))}
      <input placeholder="Nimi" value={name} onChange={e => setName(e.target.value)} />
      <input placeholder="Genre" value={genre} onChange={e => setGenre(e.target.value)} />
      <input placeholder="Julkaisuvuosi" value={year} onChange={e => setYear(e.target.value)} />
      <button onClick={searchMovies}>Hae</button>

      {results.map(m => <p key={m.id}>{m.title}</p>)}

      <h2>Nyt elokuvissa Suomessa</h2>
      <button onClick={fetchNowPlaying}>Hae elokuvat</button>

      {nowPlaying.map((m) => (
        <div key={m.id} style={{ marginBottom: 8 }}>
          <p style={{ margin: 0 }}>{m.title}</p>
          <button onClick={() => openReviews(m)}>
            Näytä arvostelut & kommentit
          </button>
        </div>
      ))}

      <hr />

      {selectedMovie && (
        <div>
          <h2>{selectedMovie.title} – arvostelut</h2>

          <ReviewForm
            movieId={selectedMovie.id}
            onSaved={() => setReviewsRefresh((prev) => prev + 1)}
          />

          <ReviewList
            key={reviewsRefresh}
            movieId={selectedMovie.id}
          />
        </div>
      )}
      {nowPlaying.map(m => <p key={m.id}>{m.title}</p>)}

      <hr />
    </>
  );
}
