// frontend/src/App.js

import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Auth from "./components/Auth";
import Groups from "./components/Groups";
import Movies from "./components/Movies";
import GroupPage from "./components/GroupPage";

function App() {
    // Token luetaan kun sovellus käynnistyy
    const [token, setToken] = useState(localStorage.getItem("token") || null);

    return (
        <Router>
            <div style={{ padding: "20px", fontFamily: "Arial" }}>
                <h1>Elokuvasovellus</h1>

                <Routes>
                    {/* ----------------------------- */}
                    {/* Etusivu / Dashboard           */}
                    {/* ----------------------------- */}
                    <Route
                        path="/"
                        element={
                            <>
                                {/* Rekisteröinti & kirjautuminen */}
                                <Auth token={token} setToken={setToken} />

                                {/* Ryhmät näkyvät kirjautuneelle käyttäjälle */}
                                <Groups token={token} />

                                {/* Elokuvahaku + Nyt elokuvissa + Arvostelut */}
                                <Movies />
                            </>
                        }
                    />

                    {/* ----------------------------- */}
                    {/* Ryhmäsivu                     */}
                    {/* ----------------------------- */}
                    <Route
                        path="/group/:groupId"
                        element={<GroupPage token={token} />}
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
