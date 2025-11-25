import { useState } from "react";

function App() {
    const [name, setName] = useState("");
    const [genre, setGenre] = useState("");
    const [year, setYear] = useState("");
    const [results, setResults] = useState([]);
    const [nowPlaying, setNowPlaying] = useState([]);
    const [signupError, setSignupError] = useState("")

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

    
    const [signupEmail, setSignupEmail] = useState("");
    const [signupPassword, setSignupPassword] = useState("");

    const [signinEmail, setSigninEmail] = useState("");
    const [signinPassword, setSigninPassword] = useState("");

    const [token, setToken] = useState(localStorage.getItem("token") || null);

  const handleSignup = async () => {
    try {
        const res = await fetch("http://localhost:3001/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user: {
                    email: signupEmail,
                    password: signupPassword
                }
            })
        });

        let data = null;

        try {
            data = await res.json();
        } catch (e) {
            console.error("Ei JSON-vastausta:", e);
        }

        console.log("Signup response:", data);

        if (!res.ok) {
            setSignupError(data.message || "Virhe rekisteröitymisessä.");
            return;
    }

        alert("Rekisteröityminen onnistui!");
        setSignupEmail("");
        setSignupPassword("");
        setSignupError("");

    } catch (err) {
        console.error("Network error:", err);
        setSignupError("Palvelimeen ei saada yhteyttä.");
    }
};


    const handleSignin = async () => {
        const res = await fetch("http://localhost:3001/api/auth/signin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user: {
                    email: signinEmail,
                    password: signinPassword
                }
            })
        });

        const data = await res.json();

        if (data.token) {
            localStorage.setItem("token", data.token);
            setToken(data.token);
            alert("Kirjautuminen onnistui!");
        } else {
            alert("Virhe kirjautumisessa.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        setToken(null);
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Arial" }}>
            <h1>Elokuvasovellus</h1>

            {/* ------------------ */}
            {/* Rekisteröinti */}
            {/* ------------------ */}

            <h2>Rekisteröidy</h2>
            <input
                type="email"
                placeholder="Email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
            />
            <input
                type="password"
                placeholder="Salasana"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
            />
            <button onClick={handleSignup}>Luo tili</button>

            {signupError && (
                <p style={{ color: "red", fontWeight: "bold" }}>
                    {signupError}
                    </p>
                )}

            <hr />

            {/* ------------------ */}
            {/* Kirjautuminen */}
            {/* ------------------ */}

            <h2>Kirjaudu sisään</h2>
            <input
                type="email"
                placeholder="Email"
                value={signinEmail}
                onChange={(e) => setSigninEmail(e.target.value)}
            />
            <input
                type="password"
                placeholder="Salasana"
                value={signinPassword}
                onChange={(e) => setSigninPassword(e.target.value)}
            />
            <button onClick={handleSignin}>Kirjaudu</button>

            {token && (
                <div>
                    <p>Kirjautunut sisään ✔</p>
                    <button onClick={handleLogout}>Kirjaudu ulos</button>
                </div>
            )}

            <hr />

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
