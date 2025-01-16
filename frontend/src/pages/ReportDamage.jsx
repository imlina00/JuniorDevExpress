import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ReportDamage = () => {
  const [damageDescription, setDamageDescription] = useState('');
  const [selectedCar, setSelectedCar] = useState('');
  const [cars, setCars] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch cars for dropdown
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await axios.get('http://localhost:3000/cars'); // Endpoint for fetching cars
        setCars(response.data);
      } catch (error) {
        setErrorMessage('Error fetching cars');
      }
    };
    
    fetchCars();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch('http://localhost:3000/report-damage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Osiguraj da koristiš ispravan token
        },
        body: JSON.stringify({ carId, damageDescription }),
      });
  
      if (response.status === 403) {
        throw new Error('Unauthorized. Provjeri svoj token.');
      }
  
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error('Greška:', error.message);
    }
  };
  

  return (
    <div>
      <h2>Report Vehicle Damage</h2>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="car">Select Car:</label>
          <select 
            id="car" 
            value={selectedCar} 
            onChange={(e) => setSelectedCar(e.target.value)}
          >
            <option value="">Select a car</option>
            {cars.map((car) => (
              <option key={car._id} value={car._id}>{car.brand} - {car.carType}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="damageDescription">Damage Description:</label>
          <textarea 
            id="damageDescription" 
            value={damageDescription} 
            onChange={(e) => setDamageDescription(e.target.value)} 
            required
          ></textarea>
        </div>
        <button type="submit">Submit Report</button>
      </form>
    </div>
  );
};

export default ReportDamage;
