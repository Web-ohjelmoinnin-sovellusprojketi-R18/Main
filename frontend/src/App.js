import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Auth from "./components/Auth";
import Groups from "./components/Groups";
import Movies from "./components/Movies";
import GroupPage from "./components/GroupPage";

function App() {
    const [token, setToken] = useState(localStorage.getItem("token"));

    return (
        <Router>
            <div style={{ padding: "20px", fontFamily: "Arial" }}>
                <h1>Elokuvasovellus</h1>

                <Routes>
                    {/* 🔹 Kaikki perustoiminnot samalla sivulla */}
                    <Route
                        path="/"
                        element={
                            <>
                            <Auth token={token} setToken={setToken} />
                            <Groups token={token} />
                            <Movies />
                            </>
                        } />
                        
                        <Route path="/group/:groupId" element={<GroupPage token={token} />} />
                    </Routes>
            </div>
        </Router>
    );
}

export default App;
