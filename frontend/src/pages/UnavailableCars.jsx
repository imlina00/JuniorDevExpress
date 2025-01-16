import axios from "axios";
import { useEffect, useState } from "react";

export default function UnavailableCars() {
  const [unavailableCars, setUnavailableCars] = useState(null);
  const [modal, setModal] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:3000/cars/unavailable").then((res) => {
      console.log(res.data);
      setUnavailableCars(res.data);
    });
  });

  return (
    <div className="user-page">
      <h1>Nedostupna vozila:</h1>
      <div>
        {unavailableCars ? (
          <div>
            {unavailableCars.map((car) => (
              <div key={car.id} className="request-div-renting">
                <p>Vozilo: {car.brand}</p>
                <button onClick={() => setModal(true)}>
                  Učini vozilo dostupnim
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>Nema nedostupnih vozila.</p>
        )}
      </div>
    </div>
  );
}
