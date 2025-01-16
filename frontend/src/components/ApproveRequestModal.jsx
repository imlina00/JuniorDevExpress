import { useEffect, useState } from "react";
import axios from "axios";

export default function ApproveRequestMessage({ modalMsg }) {
  const [approved, setApproved] = useState(false);

  console.log("Modal msg");
  console.log(modalMsg);
  useEffect(() => {
    if (modalMsg.approved) {
      setApproved(true);
    }
  }, [modalMsg.approved]);

  return (
    <div className="modal-background">
      <div className="modal-container">
        {approved ? (
          <div>
            <h3>Vozilo je uspješno dodijeljeno:</h3>
            <div>
              <p>Zaposlenik: {modalMsg.msg.employeeName}</p>
              <p>
                Trajanje: {modalMsg.msg.startDate} to {modalMsg.msg.endDate}
              </p>
            </div>
            <h3>Dodijeljeno vozilo:</h3>
            <p>{modalMsg.msg.brand}</p>
            <p>{modalMsg.msg.fuel}</p>
            <p>{modalMsg.msg.MA_transmission}</p>
            <button>Ok</button>
          </div>
        ) : (
          <div>
            <p>Uspješno dodjeljivanje vozila</p>
            <p>{modalMsg.msg}</p>
            <button>Ok</button>
          </div>
        )}
      </div>
    </div>
  );
}
