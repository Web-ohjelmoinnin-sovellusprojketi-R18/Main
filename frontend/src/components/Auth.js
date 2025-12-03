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
        body: JSON.stringify({ user: { email: signupEmail, password: signupPassword } }),
      });

      const data = await res.json();
      if (!res.ok) return setSignupError(data.message);

      setSignupEmail("");
      setSignupPassword("");
      setSignupError("");
      alert("Rekisteröinti onnistui!");
    } catch {
      setSignupError("Palvelimeen ei saada yhteyttä.");
    }
  };

  const handleSignin = async () => {
    const res = await fetch("http://localhost:3001/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: { email: signinEmail, password: signinPassword } }),
    });

    const data = await res.json();
    if (!data.token) return alert("Virhe kirjautumisessa!");

    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.id);
    setToken(data.token);
  }

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <>
      <h2>Rekisteröidy</h2>
      <input placeholder="Sähköposti"
        value={signupEmail} onChange={e => setSignupEmail(e.target.value)} />
      <input type="password" placeholder="Salasana"
        value={signupPassword} onChange={e => setSignupPassword(e.target.value)} />
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
      </>
    )}

    <hr />
  </>
);
}