import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DamageReports = () => {
  const [damageReports, setDamageReports] = useState([]);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token'); // Assuming the token is saved in localStorage

  useEffect(() => {
    if (token) {
      // Fetch all damage reports for the admin
      axios
        .get('http://localhost:3000/damage-reports', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setDamageReports(response.data);
        })
        .catch((err) => {
          setError('Error fetching damage reports');
        });
    }
  }, [token]);

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'under_review':
        return 'Under Review';
      case 'resolved':
        return 'Resolved';
      default:
        return 'Unknown';
    }
  };

  return (
    <div>
      <h1>Damage Reports</h1>
      
      {error && <div style={{ color: 'red' }}>{error}</div>}

      <table>
        <thead>
          <tr>
            <th>Report ID</th>
            <th>User</th>
            <th>Description</th>
            <th>Car Type</th>
            <th>Date of Incident</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {damageReports.map((report, index) => (
            <tr key={report._id}>
              <td>{report._id}</td>
              <td>{report.user.name}</td>
              <td>{report.description}</td>
              <td>{report.carType}</td>
              <td>{new Date(report.incidentDate).toLocaleDateString()}</td>
              <td>{getStatusLabel(report.status)}</td>
              <td>
                {/* Here you can add buttons to resolve or update the status of the report */}
                {report.status === 'pending' && (
                  <button onClick={() => handleUpdateStatus(report._id, 'under_review')}>Start Review</button>
                )}
                {report.status === 'under_review' && (
                  <button onClick={() => handleUpdateStatus(report._id, 'resolved')}>Resolve</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const handleUpdateStatus = (reportId, newStatus) => {
  const token = localStorage.getItem('token');
  axios
    .put(
      `http://localhost:3000/damage-reports/${reportId}/status`,
      { status: newStatus },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .then((response) => {
      alert('Report status updated');
      // You might want to update the state here, or refetch reports
    })
    .catch((err) => {
      alert('Error updating status');
    });
};

export default DamageReports;
