import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function GroupPage({ token }) {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [error, setError] = useState("");
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");

    const fetchGroup = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/groups/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.status === 403) {
          setGroup({
            name: "Tuntematon ryhmä",
            owner_id: null,
            is_member: false,
            is_owner: false
          });
          setError("Et kuulu tähän ryhmään 👀");
          return;
        }

        if (!res.ok) {
          setError("Virhe ryhmän avauksessa");
          return;
        }

        const data = await res.json();
        setGroup(data);

        if (data.is_owner) {
          fetchRequests();
    }

      } catch (err) {
        setError("Palvelinvirhe");
      }
    };

    const sendJoinRequest = async () => {
    const res = await fetch(`http://localhost:3001/api/groups/${groupId}/join`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    setMessage(data.message);
  };

  const fetchRequests = async () => {
    const res = await fetch(`http://localhost:3001/api/groups/${groupId}/requests`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok) {
      const data = await res.json();
      setRequests(data);
    }
  };

 const handleRequestAction = async (requestId, action) => {
  try {
    const response = await fetch(
      `http://localhost:3001/api/groups/${groupId}/requests/${requestId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Virhe toiminnossa");
      return;
    }

    setMessage(data.message);
    fetchRequests();
    fetchGroup();

  } catch (error) {
    console.error("Virhe:", error);
    setMessage("Palvelinvirhe");
  }
};

  useEffect(() => {
    if (!token) {
      return navigate("/"); 
    }

    fetchGroup();
    fetchRequests();
  }, [groupId, token, navigate]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Ryhmäsivu</h1>

      {message && 
        <p style={{ color: "green" }}>{message}</p>}

      {error && (
        <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>
      )}

      {!error && !group && <p>Ladataan...</p>}

      {group && (
        <>
          <h2>Ryhmä: {group.name}</h2>
          <p>Omistaja: {group.owner_id}</p>
          <p>Tänne voit myöhemmin lisätä ryhmän sisällön</p>

          {!group.is_member && !group.is_owner && (
            <>
            <button onClick={sendJoinRequest}>
              Lähetä liittymispyyntö
            </button>
            </>
          )}
          {group.is_owner && (
            <div>
              <h3>Odottavat pyynnöt</h3>

              {requests.length === 0 && <p>Ei odottavia pyyntöjä</p>}

              <ul>
                {requests.map((req) => (
                  <li key={req.id}>
                    Käyttäjä ID: {req.user_id}
                    <button
                      onClick={() => handleRequestAction(req.id, "accept")}
                      style={{ marginLeft: "10px" }}
                    >
                      ✔ Hyväksy
                    </button>
                    <button
                      onClick={() => handleRequestAction(req.id, "reject")}
                      style={{ marginLeft: "10px", color: "red" }}
                    >
                      ✖ Hylkää
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}