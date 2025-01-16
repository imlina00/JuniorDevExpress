import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPage = () => {
  const [userRequests, setUserRequests] = useState([]);
  const [cars, setCars] = useState([]); // Dodano za dohvat vozila
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingRequestId, setEditingRequestId] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null); // Dodano za odabir vozila
  const token = localStorage.getItem('token');

  useEffect(() => {
    const storedRequests = localStorage.getItem("userRequests");
    const storedCars = localStorage.getItem("cars");

    if (storedRequests && storedCars) {
      setUserRequests(JSON.parse(storedRequests));
      setCars(JSON.parse(storedCars));
    } else if (token) {
      axios
        .get('http://localhost:3000/user-requests/all-requests', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setUserRequests(response.data);
          localStorage.setItem('userRequests', JSON.stringify(response.data)); // Pohrani u localStorage
        })
        .catch((err) => {
          setError('Greška pri dohvaćanju svih zahtjeva');
        });

      // Dohvati sva vozila
      axios
        .get('http://localhost:3000/cars', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setCars(response.data);
          localStorage.setItem('cars', JSON.stringify(response.data)); // Pohrani u localStorage
        })
        .catch((err) => {
          setError('Greška pri dohvaćanju vozila');
        });
    }
  }, [token]);

  const handleApproveRequest = (requestId, carId) => {
    // Provjerite je li vozilo već zauzeto
    const car = cars.find((car) => car._id === carId);
    if (!car || car.reservations.some((r) => r.status === 'approved')) {
      setError('Vozilo je već zauzeto');
      return;
    }

    // Dodjela vozila i ažuriranje statusa zahtjeva
    axios
      .put(
        `http://localhost:3000/user-requests/${requestId}/status`,
        { status: 'approved', carId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        setUserRequests(
          userRequests.map((req) =>
            req._id === requestId ? { ...req, status: 'approved', carId } : req
          )
        );
        setSuccessMessage(`Zahtjev s ID ${requestId} odobren i dodijeljeno vozilo`);
      })
      .catch((err) => {
        setError('Greška pri odobravanju zahtjeva');
      });
  };

  const handleRejectRequest = (requestId) => {
    axios
      .put(
        `http://localhost:3000/user-requests/${requestId}/status`,
        { status: 'denied' },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        setUserRequests(
          userRequests.map((req) =>
            req._id === requestId ? { ...req, status: 'denied' } : req
          )
        );
        setSuccessMessage(`Zahtjev s ID ${requestId} odbijen`);
      })
      .catch((err) => {
        setError('Greška pri odbijanju zahtjeva');
      });
  };

  const handleEditRequest = (requestId) => {
    setEditingRequestId(requestId);
  };

  const handleCancelEdit = () => {
    setEditingRequestId(null);
  };

  const handleSelectCar = (car) => {
    setSelectedCar(car);
  };

  const isCarAvailable = (car, request) => {
    const startDate = new Date(request.startDate);
    const endDate = new Date(request.endDate);

    // Provjerite da li je vozilo dostupno u tom periodu i nije zauzeto
    return !car.reservations.some(
      (r) =>
        (new Date(r.startDate) <= endDate && new Date(r.endDate) >= startDate) ||
        r.status === 'approved' // Provjeravamo je li vozilo već dodijeljeno
    );
  };

  return (
    <div>
      <h1>Dobrodošli na administratorsku stranicu</h1>

      {error && <div style={{ color: 'red' }}>{error}</div>}
      {successMessage && <div style={{ color: 'green' }}>{successMessage}</div>}

      <h2>Svi zahtjevi</h2>
      <table>
        <thead>
          <tr>
            <th>Ime korisnika</th>
            <th>Vrsta vozila</th>
            <th>Razlog</th>
            <th>Početak</th>
            <th>Kraj</th>
            <th>Dodijeljeno vozilo</th> {/* Nova kolona za dodijeljeno vozilo */}
            <th>Akcija</th>
          </tr>
        </thead>
        <tbody>
          {userRequests.map((request, index) => (
            <tr key={index}>
              <td>{request.userId.name}</td>
              <td>{request.carType}</td>
              <td>{request.reason}</td>
              <td>{new Date(request.startDate).toLocaleDateString()}</td>
              <td>{new Date(request.endDate).toLocaleDateString()}</td>
              
              {/* Prikaz dodijeljenog vozila */}
              <td>
                {request.carId ? (
                  <>
                    {cars.find((car) => car._id === request.carId)?.brand} -{' '}
                    <span style={{ color: 'green' }}>Zauzeto</span>
                  </>
                ) : (
                  <span style={{ color: 'blue' }}>Slobodno</span>
                )}
              </td>

              <td>
                {editingRequestId === request._id ? (
                  <>
                    {/* Prikaz dostupnih vozila */}
                    <select
                      onChange={(e) =>
                        handleSelectCar(cars.find((car) => car._id === e.target.value))
                      }
                    >
                      <option value="">Izaberite vozilo</option>
                      {cars
                        .filter(
                          (car) =>
                            isCarAvailable(car, request) && !car.reservations.some(
                              (r) => r.status === 'approved' // Ovdje provjeravamo je li vozilo već zauzeto
                            )
                        ) // Filtriranje vozila koja su dostupna i nisu zauzeta
                        .map((car) => (
                          <option key={car._id} value={car._id}>
                            {car.brand} ({car.carType})
                          </option>
                        ))}
                    </select>
                    <button
                      onClick={() => handleApproveRequest(request._id, selectedCar._id)}
                    >
                      Prihvati zahtjev i dodijeli vozilo
                    </button>
                    <button onClick={handleCancelEdit}>Otkaži uređivanje</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEditRequest(request._id)}>
                      Uredi
                    </button>
                    {request.status !== 'approved' && request.status !== 'denied' && (
                      <button onClick={() => handleRejectRequest(request._id)}>
                        Odbij
                      </button>
                    )}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPage;
