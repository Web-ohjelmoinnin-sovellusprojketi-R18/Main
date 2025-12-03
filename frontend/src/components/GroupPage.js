import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function GroupPage({ token }) {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      return navigate("/"); // ei kirjautunut → ulos
    }

    const fetchGroup = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/groups/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.status === 403) {
          setError("Et kuulu tähän ryhmään 👀");
          return;
        }

        if (!res.ok) {
          setError("Virhe ryhmän avauksessa");
          return;
        }

        const data = await res.json();
        setGroup(data);
      } catch (err) {
        setError("Palvelinvirhe");
      }
    };

    fetchGroup();
  }, [groupId, token, navigate]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Ryhmäsivu</h1>

      {error && (
        <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>
      )}

      {!error && !group && <p>Ladataan...</p>}

      {group && (
        <>
          <h2>Ryhmä: {group.name}</h2>
          <p>Omistaja: {group.owner_id}</p>
          <p>Tänne voit myöhemmin lisätä ryhmän sisällön</p>
        </>
      )}
    </div>
  );
}
