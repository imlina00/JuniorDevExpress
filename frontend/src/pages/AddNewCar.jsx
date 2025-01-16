import { useState } from "react";
import axios from "axios";
import Modal from "react-modal";

// Set app element for accessibility
Modal.setAppElement("#root");

export default function AddNewCar() {
  const [newCar, setNewCar] = useState({
    brand: "",
    carType: "standard",
    fuel: "Diesel",
    MA_transmission: "Manual",
  });

  const [successModal, setSuccessModal] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCar({ ...newCar, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token"); // Or use wherever you're storing the token
  
    axios
      .post("http://localhost:3000/cars", newCar, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        console.log(res);
        setSuccessModal(true); // Show success modal
      })
      .catch((err) => console.error("Error adding car:", err));
  };
  

  const handleCloseModal = () => {
    setSuccessModal(false); // Close the modal
    window.location.reload(); // Reload the page
  };

  return (
    <div className="user-page">
      <h1>Dodaj novo vozilo</h1>
      <form onSubmit={handleSubmit}>
        {/* Brand Input */}
        <div>
          <label>
            <strong>Proizvođač:</strong>
          </label>
          <input
            type="text"
            id="brand"
            name="brand"
            value={newCar.brand}
            onChange={handleInputChange}
            required
            style={{ width: "200px", height: "20px", marginLeft: "10px" }}
          />
        </div>

        {/* Car Type Radio Buttons */}
        <div className="radio-buttons-container">
          <label>
            <strong>Vrsta:</strong>
          </label>
          <div>
            <label>
              <input
                type="radio"
                name="carType"
                value="standard"
                checked={newCar.carType === "standard"}
                onChange={handleInputChange}
              />
              Standard
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="carType"
                value="minivan"
                checked={newCar.carType === "minivan"}
                onChange={handleInputChange}
              />
              Minivan
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="carType"
                value="mini"
                checked={newCar.carType === "mini"}
                onChange={handleInputChange}
              />
              Mini
            </label>
          </div>
        </div>

        {/* Fuel Type Radio Buttons */}
        <div className="radio-buttons-container">
          <label>
            <strong>Gorivo:</strong>
          </label>
          <div>
            <label>
              <input
                type="radio"
                name="fuel"
                value="Diesel"
                checked={newCar.fuel === "Diesel"}
                onChange={handleInputChange}
              />
              Dizel
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="fuel"
                value="Petrol"
                checked={newCar.fuel === "Petrol"}
                onChange={handleInputChange}
              />
              Benzin
            </label>
          </div>
        </div>

        {/* Transmission Type Radio Buttons */}
        <div className="radio-buttons-container">
          <label>
            <strong>Mijenjač:</strong>
          </label>
          <div>
            <label>
              <input
                type="radio"
                name="MA_transmission"
                value="Manual"
                checked={newCar.MA_transmission === "Manual"}
                onChange={handleInputChange}
              />
              Manualni
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="MA_transmission"
                value="Automatic"
                checked={newCar.MA_transmission === "Automatic"}
                onChange={handleInputChange}
              />
              Automatik
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button type="submit">Dodaj vozilo</button>
        </div>
      </form>

      {/* Success Modal */}
      <Modal
        isOpen={successModal}
        onRequestClose={handleCloseModal}
        contentLabel="Success Modal"
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            color: "black",
          },
        }}
      >
        <h2>Vozilo je uspješno dodano!</h2>
        <button onClick={handleCloseModal} style={{ marginTop: "20px" }}>
          Ok
        </button>
      </Modal>
    </div>
  );
}
