import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";

export default function Groups({ token }) {
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [groupError, setGroupError] = useState("");

  // Dekoodataan token vain kerran ja turvallisesti
  const currentUserId = useMemo(() => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.id ?? null;
    } catch {
      return null;
    }
  }, [token]);

  const fetchGroups = async () => {
    if (!token) return;

    try {
      const res = await fetch("http://localhost:3001/api/groups", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg =
          data.error || data.message || "Ryhmien hakeminen epäonnistui";
        setGroupError(msg);
        return;
      }

      const data = await res.json();
      setGroups(Array.isArray(data) ? data : []);
      setGroupError("");
    } catch (err) {
      setGroupError("Yhteys palvelimeen epäonnistui ryhmiä haettaessa.");
    }
  };

  const createGroup = async () => {
    if (!newGroupName.trim()) {
      setGroupError("Ryhmän nimi ei voi olla tyhjä.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/api/groups", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: newGroupName })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = data.error || data.message || "Ryhmän luonti epäonnistui.";
        setGroupError(msg);
        return;
      }

      setNewGroupName("");
      setGroupError("");
      fetchGroups();
    } catch (err) {
      setGroupError("Yhteys palvelimeen epäonnistui ryhmää luodessa.");
    }
  };

  const deleteGroup = async (id) => {
    try {
      const res = await fetch(`http://localhost:3001/api/groups/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg =
          data.error || data.message || "Ryhmän poistaminen epäonnistui.";
        setGroupError(msg);
        return;
      }

      setGroupError("");
      fetchGroups();
    } catch (err) {
      setGroupError("Yhteys palvelimeen epäonnistui ryhmää poistaessa.");
    }
  };

  useEffect(() => {
    if (token) {
      fetchGroups();
    } else {
      setGroups([]);
    }
  }, [token]);

  return (
    <>
      <h2>Ryhmät</h2>

      {token ? (
        <>
          <input
            placeholder="Ryhmän nimi"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
          />
          <button onClick={createGroup}>Luo ryhmä</button>
        </>
      ) : (
        <p>Kirjaudu sisään luodaksesi ryhmän.</p>
      )}

      {groupError && <p style={{ color: "red" }}>{groupError}</p>}

      <h3>Ryhmälista</h3>
      <ul>
        {Array.isArray(groups) && groups.length > 0 ? (
          groups.map((g) => (
            <li key={g.id}>
              <Link to={`/group/${g.id}`}>{g.name}</Link>

              {token && currentUserId === g.owner_id && (
                <button
                  style={{ marginLeft: "10px", color: "red" }}
                  onClick={() => deleteGroup(g.id)}
                >
                  Poista
                </button>
              )}
            </li>
          ))
        ) : (
          <p>Ei ryhmiä saatavilla</p>
        )}
      </ul>

      <hr />
    </>
  );
}