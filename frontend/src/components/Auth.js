import { useState } from "react";

export default function Auth({ token, setToken }) {
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signinEmail, setSigninEmail] = useState("");
  const [signinPassword, setSigninPassword] = useState("");
  const [signupError, setSignupError] = useState("");

  const handleSignup = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: { email: signupEmail, password: signupPassword }
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = data.message || data.error || "Rekisteröinti epäonnistui.";
        setSignupError(msg);
        return;
      }

      setSignupEmail("");
      setSignupPassword("");
      setSignupError("");
      alert("Rekisteröinti onnistui!");
    } catch {
      setSignupError("Palvelimeen ei saada yhteyttä.");
    }
  };

  const handleSignin = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: { email: signinEmail, password: signinPassword }
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.token) {
        alert(data.message || data.error || "Virhe kirjautumisessa!");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.id);
      setToken(data.token);

      // halutessa tyhjennä kentät
      setSigninEmail("");
      setSigninPassword("");
    } catch (err) {
      console.error(err);
      alert("Palvelimeen ei saada yhteyttä.");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setToken(null);
  };

  const deleteAccount = async () => {
    if (!window.confirm("Haluatko varmasti poistaa käyttäjätilisi?")) {
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/api/auth/delete", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.message || data.error || "Virhe tilin poistamisessa");
        return;
      }

      alert("Käyttäjätilisi on poistettu");

      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      setToken(null);
    } catch (err) {
      console.error(err);
      alert("Palvelinvirhe");
    }
  };

  return (
    <>
      <h2>Rekisteröidy</h2>
      <input
        placeholder="Sähköposti"
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

      {signupError && <p style={{ color: "red" }}>{signupError}</p>}

      <h2>Kirjaudu sisään</h2>

      {!token ? (
        <>
          <input
            placeholder="Sähköposti"
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
        </>
      ) : (
        <>
          <p>Kirjautunut sisään ✔</p>
          <button onClick={logout}>Kirjaudu ulos</button>
          <button onClick={deleteAccount}>Poista käyttäjätili</button>
        </>
      )}

      <hr />
    </>
  );
}