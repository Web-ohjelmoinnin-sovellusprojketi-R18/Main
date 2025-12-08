import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Groups({ token }) {
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [groupError, setGroupError] = useState("");

  const fetchGroups = async () => {
    if (!token) return;
    const res = await fetch("http://localhost:3001/api/groups", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setGroups(await res.json());
  };

  const createGroup = async () => {
    const res = await fetch("http://localhost:3001/api/groups", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name: newGroupName })
    });

    const data = await res.json();
    if (!res.ok) return setGroupError(data.message);

    setNewGroupName("");
    fetchGroups();
  };

  const deleteGroup = async (id) => {
    await fetch(`http://localhost:3001/api/groups/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchGroups();
  };

  useEffect(() => {
    if (token) fetchGroups();
  }, [token]);

  return (
    <>
      <h2>Ryhmät</h2>

      {token ? (
        <>
          <input placeholder="Ryhmän nimi"
            value={newGroupName}
            onChange={e => setNewGroupName(e.target.value)} />
          <button onClick={createGroup}>Luo ryhmä</button>
        </>
      ) : (
        <p>Kirjaudu sisään luodaksesi ryhmän.</p>
      )}

      {groupError && <p style={{ color: "red" }}>{groupError}</p>}

      <h3>Ryhmälista</h3>
      <ul>
  {Array.isArray(groups) ? (
    groups.map(g => (
      <li key={g.id}>
        <Link to={`/group/${g.id}`}>{g.name}</Link>

        {token && g.owner_id === JSON.parse(atob(token.split(".")[1])).id && (
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
