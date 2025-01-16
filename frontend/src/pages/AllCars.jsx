import { useEffect, useState } from "react";
import axios from "axios";

export default function AllCars() {
  const [allCars, setAllCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);

  useEffect(() => {
    // Dohvati sva vozila, neovisno o njihovoj dostupnosti
    axios.get("http://localhost:3000/cars/all-cars").then((res) => {
      console.log(res.data); // Provjera strukture podataka
      setAllCars(res.data);
    });
  }, []);

  const handleCarClick = (car) => {
    console.log(car); // Provjera detalja automobila
    setSelectedCar(car);
  };

  return (
    <div>
      <h1>Sva vozila</h1>
      {/* Horizontalna lista vozila */}
      <div className="car-list">
        {allCars.map((car) => (
          <div
            key={car._id}
            className="car-item"
            onClick={() => handleCarClick(car)}
          >
            <h3>{car.brand}</h3>
            <p>{car.carType}</p>
            <p>{car.fuel}</p>
            <p>{car.MA_transmission}</p>
            <p>
              <strong>Dostupno:</strong>{" "}
              {car.aviability?.isAvailable !== undefined
                ? car.aviability.isAvailable
                  ? "Da"
                  : "Ne"
                : "N/A"}
            </p>
          </div>
        ))}
      </div>

      {/* Detalji automobila */}
      <br />
      <hr />
      {selectedCar && (
        <div className="car-details">
          <h2>{selectedCar.brand}</h2>
          <p>
            <strong>Tip:</strong> {selectedCar.carType} <strong>Gorivo: </strong>
            {selectedCar.fuel} <strong>Transmission:</strong>{" "}
            {selectedCar.MA_transmission}
          </p>
          <p>
            <strong>Šteta:</strong>{" "}
            {selectedCar.damaged !== undefined
              ? selectedCar.damaged
                ? "Da"
                : "Ne"
              : "N/A"}
          </p>
          <p>
            <strong>Dostupno:</strong>{" "}
            {selectedCar.aviability?.isAvailable !== undefined
              ? selectedCar.aviability.isAvailable
                ? "Da"
                : "Ne"
              : "N/A"}
          </p>

          {/* Kalendar s rezervacijama */}
          <h3>Rezervacije:</h3>
          {selectedCar.reservations ? (
            <Calendar
              tileContent={({ date }) => {
                const formattedDate = date.toISOString().split("T")[0];
                const reservation = selectedCar.reservations.find(
                  (r) =>
                    new Date(r.startDate).toISOString().split("T")[0] <=
                      formattedDate &&
                    formattedDate <=
                      new Date(r.endDate).toISOString().split("T")[0]
                );
                return reservation ? (
                  <span className="reserved">Rezervirano</span>
                ) : null;
              }}
            />
          ) : (
            <p>Nema rezervacija za ovo vozilo.</p>
          )}
        </div>
      )}
    </div>
  );
}
