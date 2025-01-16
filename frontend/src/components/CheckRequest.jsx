import { useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-modal";

export default function CheckRequest({ setCheckReqPage, checkRequest }) {
  const [availableCars, setAvailableCars] = useState(null);
  const [message, setMessage] = useState(null);
  const [modal, setModal] = useState(false);
  const [modalMsg, setModalMsg] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:3000/cars/available", {
        params: {
          carType: checkRequest.carType,
          startDate: checkRequest.startDate,
          endDate: checkRequest.endDate,
        },
      })
      .then((res) => {
        if (res.data.message) {
          setMessage(res.data.message);
          setAvailableCars(null);
        } else if (res.data.availableCars) {
          setAvailableCars(res.data.availableCars);
          setMessage(null);
        }
      })
      .catch((error) => {
        console.error("Error fetching available cars:", error);
        setMessage("An error occurred while fetching available cars.");
      });
  }, [checkRequest]);

  const approveRequest = (car) => {
    axios
      .patch("http://localhost:3000/cars/approve", {
        startDate: checkRequest.startDate,
        endDate: checkRequest.endDate,
        requester_id: checkRequest.requester,
        request_id: checkRequest._id,
        car_id: car._id,
      })
      .then(() => {
        axios
          .patch("http://localhost:3000/user-requests/approve-request", {
            req_id: checkRequest._id,
            status: "approved",
            car_id: car._id,
          })
          .then(() => {
            setModalMsg("Request successfully approved!");
            setModal(true);
          })
          .catch((error) => {
            console.error("Error updating request status:", error);
            setModalMsg("Failed to update request status.");
            setModal(true);
          });
      })
      .catch((error) => {
        console.error("Error approving car reservation:", error);
        setModalMsg("Failed to approve car reservation.");
        setModal(true);
      });
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

  const closeModal = () => {
    setModal(false);
    window.location.reload(); // Reload the page
  };

  return (
    <div className="check-request-page">
      <button
        style={{ backgroundColor: "#646cff" }}
        onClick={() => setCheckReqPage(false)}
      >
        Back
      </button>
      <div style={{ display: "flex" }}>
        <div style={{ marginRight: "60px" }}>
          <h2>Provjeri zahtjev:</h2>
          <p>
            <strong>Zaposlenikovo ime:</strong> {checkRequest.name}
          </p>
          <p>
            <strong>Zaposlenikov email:</strong> {checkRequest.email}
          </p>
        </div>
        <div>
          <h2>Posebni zahtjevi:</h2>
          <p>
            <strong>Vrsta vozila:</strong> {checkRequest.carType}
          </p>
          <p>
            <strong>Početno vrijeme:</strong>{" "}
            {formatDateTime(checkRequest.startDate)}
          </p>
          <p>
            <strong>Krajnje vrijeme:</strong> {formatDateTime(checkRequest.endDate)}
          </p>
        </div>
      </div>

      <h2>Dostupna vozila:</h2>
      <i>*uz posebne zahtjeve</i>
      <div>
        {message && <p>{message}</p>}
        {availableCars && (
          <div style={{ display: "flex" }}>
            {availableCars.map((car, index) => (
              <div key={index} className="available-cars-div">
                <h4>{car.brand}</h4>
                <p>{car.fuel}</p>
                <p>{car.MA_transmission}</p>
                <button onClick={() => approveRequest(car)}>
                  Odobri zahtjev
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={modal}
        onRequestClose={closeModal}
        contentLabel="Approval Modal"
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            color: "black",
          },
        }}
      >
        <h2>{modalMsg}</h2>
        <button onClick={closeModal} style={{ marginTop: "20px" }}>
          OK
        </button>
      </Modal>
    </div>
  );
}
