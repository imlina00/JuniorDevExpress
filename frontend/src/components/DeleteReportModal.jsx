import axios from "axios";
import { useState } from "react";

export default function DeleteReportModal({
  setDeleteReportModal,
  deleteReport,
  onReportDeleted, // Optional callback for parent state update
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = () => {
    setLoading(true);
    setError(null);

    axios
      .delete(`http://localhost:3000/issue-reports/${deleteReport._id}`)
      .then((res) => {
        console.log(res.data.message);
        setLoading(false);
        setDeleteReportModal(false); // Close modal
        if (onReportDeleted) onReportDeleted(deleteReport._id); // Notify parent
      })
      .catch((err) => {
        console.error("Error deleting report:", err);
        setError("Failed to delete the report. Please try again.");
        setLoading(false); // Stop loading
      });
  };

  return (
    <div className="modal-background">
      <div className="modal-container">
        <button
          className="exit-modal"
          onClick={() => setDeleteReportModal(false)}
        >
          X
        </button>
        <h3>Je li problem s Vašim vozilom riješen?</h3>
        <p>Jeste li sigurni da želite obrisati prijavu?</p>
        {error && <p className="error-message">{error}</p>}{" "}
        {/* Display error */}
        <button onClick={handleDelete} disabled={loading}>
          {loading ? "Deleting..." : "Yes."}
        </button>
      </div>
    </div>
  );
}
