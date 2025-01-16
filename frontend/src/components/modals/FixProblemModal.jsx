import axios from "axios";

export default function FixProblemModal({ setFixProblemModal, fixProblem }) {
  const handleFixProblem = () => {
    axios
      .patch(`http://localhost:3000/cars/${fixProblem.carId}`, {
        damaged: false,
      })
      .then((res) => {
        console.log(res.data);
        setFixProblemModal(false);
      })
      .catch((err) => console.log(err));

    axios.patch(`http://localhost:3000/issue-reports/${fixProblem._id}`, {
      status: "resolved",
    });
  };

  return (
    <div className="modal-background">
      <div className="modal-container">
        <button
          className="exit-modal"
          onClick={() => setFixProblemModal(false)}
        >
          X
        </button>
        <h3>Damaged was fixed </h3>
        <p>Was the damage on the report fixed?</p>
        <button onClick={() => handleFixProblem()}>Yes.</button>
      </div>
    </div>
  );
}
