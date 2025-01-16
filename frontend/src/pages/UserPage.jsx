import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserPage = () => {
  const [userRequests, setUserRequests] = useState([]);
  const [carType, setCarType] = useState('');
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);


  axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;

  const token = localStorage.getItem('token'); // Assuming the token is saved in localStorage
  console.log('Token:', token); // Check if the token is valid
  
  useEffect(() => {
    if (!token) {
      setError('Token nije pronađen. Molimo prijavite se.');
      return;
    }
  
    console.log("Token:", token); // Provjera tokena
    axios
      .get('http://localhost:3000/user-requests/my-requests', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setUserRequests(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching requests:", err.response?.data || err.message);
        setError('Greška prilikom dohvaćanja zahtjeva.');
        setLoading(false);
      });
  }, [token]);
  

  const handleSubmitRequest = (e) => {
    e.preventDefault();

    // Validate input
    if (!carType || !reason || !startDate || !endDate) {
      setError('Please fill in all the fields');
      return;
    }

    const newRequest = {
      carType,
      reason,
      startDate,
      endDate,
    };

    
    if (!token) {
      setError('Niste prijavljeni. Molimo prijavite se.');
      return;
    }
    
    axios
      .post('http://localhost:3000/user-requests', newRequest, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setSuccessMessage('Zahtjev uspješno poslan.');
        setUserRequests((prevRequests) => [...prevRequests, response.data]);
        setCarType('');
        setReason('');
        setStartDate('');
        setEndDate('');
      })
      .catch((err) => {
        console.error('Error submitting request:', err.response?.data || err.message);
        setError('Greška prilikom slanja zahtjeva.');
      });    

  };

  const checkIfEditable = (startDate) => {
    const currentDate = new Date();
    const start = new Date(startDate);
    return currentDate < start;  // If current date is before the start of reservation, it's editable
  };

  const getRequestStatus = (status) => {
    switch (status) {
      case 'approved':
        return 'Approved Reservation';
      case 'denied':
        return 'Denied Reservation';
      default:
        return 'No Status';
    }
  };

  const handleCancelRequest = (requestId) => {
    console.log("Request ID:", requestId);  // Logiraj ID za provjeru
    const requestToCancel = userRequests.find((req) => req._id === requestId);
    const isEditable = checkIfEditable(requestToCancel.startDate); // Check if it's possible to cancel (before start)

    if (!isEditable) {
      setError('You cannot cancel this reservation as it has already started');
      return;
    }

    axios
    .put(
      `http://localhost:3000/user-requests/${requestId}/status`,
      { status: 'denied' },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .then((response) => {
      setSuccessMessage('Reservation successfully cancelled');
      setUserRequests(
        userRequests.map((req) =>
          req._id === requestId ? { ...req, status: 'denied' } : req
        )
      );
    })
    .catch((err) => {
      setError('Error cancelling reservation');
    });
};

  

  return (
    <div>
      <h1>Welcome to the User Page</h1>

      {error && <div style={{ color: 'red' }}>{error}</div>}
      {successMessage && <div style={{ color: 'green' }}>{successMessage}</div>}

      <h2>Your Requests</h2>
      <table>
        <thead>
          <tr>
            <th>Car Type</th>
            <th>Reason</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
            <th>Activity</th>
            <th>Action</th> {/* Added Action column */}
          </tr>
        </thead>
        <tbody>
          {userRequests.map((request, index) => {
            const isEditable = checkIfEditable(request.startDate); // Check if it's editable
            return (
              <tr key={index}>
                <td>{request.carType}</td>
                <td>{request.reason}</td>
                <td>{new Date(request.startDate).toLocaleDateString()}</td>
                <td>{new Date(request.endDate).toLocaleDateString()}</td>
                <td>{getRequestStatus(request.status)}</td>
                <td>
                  {request.status === 'approved' && (isEditable ? 'Inactive' : 'Active')}
                </td>
                <td>
                  {request.status === 'approved' && isEditable && (
                    <button onClick={() => handleCancelRequest(request._id)}>Cancel</button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

    </div>
  );
};

export default UserPage;
