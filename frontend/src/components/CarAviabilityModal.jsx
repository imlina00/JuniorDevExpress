import axios from "axios";

export default function CarAviabilityModal({
  setUnavailableCarModal,
  unavailableCar,
}) {
  const makeCarUnavailable = () => {
    axios
      .patch(`http://localhost:3000/cars/${unavailableCar.carId}`, {
        aviability: {
          isAvailable: false,
        },
        damaged: true,
      })
      .then((res) => {
        console.log(res.data);
        setUnavailableCarModal(false);
      })
      .catch((err) => console.log(err));
  };
  return (    <div className="modal-background">
      <div className="modal-container">
        <button
          className="exit-modal"
          onClick={() => setUnavailableCarModal(false)}
        >
          X
        </button>
        <h3>Učini {unavailableCar.carBrand} nedostupnim</h3>
        <p>Jeste li sigurni da želite prijaviti vozilo kao nedostupno?</p>
        <button onClick={() => makeCarUnavailable()}>Da.</button>
      </div>
    </div>
  );
}
