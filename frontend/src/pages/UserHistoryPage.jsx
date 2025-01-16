import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

import IssueForm from "../components/IssueForm";

//ovu stranicu micemo

export default function UserHistoryPage() {
  const [deniedRequests, setDeniedRequests] = useState([]);
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [user, setUser] = useState(null);
  const [modal, setModal] = useState(false);
  const [problemReq, setProblemReq] = useState(null);

  const checkIfPastRequests = (endDate) => {
    const currentDate = new Date();
    const end = new Date(endDate);
    return currentDate >= end;
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const { id, role } = decodedToken;

        // Fetching user data
        axios
          .get("http://localhost:3000/user", {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            console.log("User data fetched:", response.data);
            setUser(response.data); // Postavljanje korisničkih podataka
          })
          .catch((error) => {
            console.error("Error fetching user data:", error);
          });

        // Fetching user requests
        axios
          .get(`http://localhost:3000/user-requests/my-requests`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            console.log("User requests fetched:", response.data);
            const approved = [];
            const denied = [];
            response.data.forEach((request) => {
              if (request.status === "approved" && checkIfPastRequests(request.endDate)) {
                approved.push(request);
              } else if (request.status === "denied") {
                denied.push(request);
              }
            });
            setApprovedRequests(approved); // Postavljanje odobrenih zahtjeva
            setDeniedRequests(denied); // Postavljanje odbijenih zahtjeva
          })
          .catch((error) => {
            console.error("Error fetching user requests:", error);
          });
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    } else {
      console.log("No token found");
    }
  }, []);

  // Provjera je li korisnik podignut, inače prikazujemo Loading
  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div className="pages">
      <h1>Povijest zahtjeva:</h1>
      
      <h2>Prošli odobreni zahtjevi:</h2>
      {approvedRequests.length > 0 ? (
        <div className="requests-container">
          {approvedRequests.map((request) => (
            <div key={request._id} className="request-div-approved">
              <p>Vozilo: {request.carType}</p>
              <p>Trajanje: <u>{formatDateTime(request.startDate)}</u> do <u>{formatDateTime(request.endDate)}</u></p>
              <p>Razlog: {request.reason}</p>
              <p>Status: {request.status}</p>
              <br />
              <button
                onClick={() => {
                  setModal(true);
                  setProblemReq(request);
                }}
              >
                Prijavi problem
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>Bez odobrenih zahtjeva u prošlosti.</p>
      )}

      <hr />
      
      <h2>Odbijeni zahtjevi:</h2>
      {deniedRequests.length > 0 ? (
        <div className="requests-container">
          {deniedRequests.map((request) => (
            <div key={request._id} className="request-div-denied">
              <p>Vozilo: {request.carType}</p>
              <p>Razlog: {request.reason}</p>
              <p>Trajanje: <u>{formatDateTime(request.startDate)}</u> do <u>{formatDateTime(request.endDate)}</u></p>
              <p>Status: {request.status}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>Bez odbijenih zahtjeva u prošlosti</p>
      )}
      
      {modal && <IssueForm setModal={setModal} problemReq={problemReq} />}
    </div>
  );
}
