import { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Modal from "react-modal";

Modal.setAppElement("#root"); // Set the root element for accessibility

export default function UserRequestForm() {
  const [user, setUser] = useState(null);
  const [request, setRequest] = useState({
    name: "",
    email: "",
    carType: "",
    reason: "",
    startDate: null,
    endDate: null,
  });
  const [errors, setErrors] = useState({});
  const [modalMessage, setModalMessage] = useState(null); // For the modal message
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [currentDate, setCurrentDate] = useState(new Date()); // Trenutni datum
  const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get("http://localhost:3000/user", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setUser(response.data);
          setRequest((prev) => ({
            ...prev,
            name: response.data.name,
            email: response.data.email,
          }));
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!request.carType) {
      newErrors.carType = "Please select a car type.";
    }
    if (!request.reason) {
      newErrors.reason = "Please select a reason.";
    }
    if (!request.startDate) {
      newErrors.startDate = "Please select a start date.";
    }
    if (!request.endDate) {
      newErrors.endDate = "Please select an end date.";
    }
    if (request.startDate && request.endDate && request.endDate <= request.startDate) {
      newErrors.endDate = "End date must be after the start date.";
    }
    
    return newErrors;
  };

  const submitRequest = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }
  
    const startDate = new Date(request.startDate);
    if (startDate < currentDate) {
      setModalMessage("Početni datum ne može biti u prošlosti.");
      setIsModalOpen(true);
      setIsLoading(false);
      return;
    }
  
    setErrors({});
    const token = localStorage.getItem("token");
  
    if (!token) {
      setModalMessage("You are not authenticated. Please log in.");
      setIsModalOpen(true);
      setIsLoading(false);
      return;
    }
  
    try {
      await axios.post("http://localhost:3000/user-requests", request, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setModalMessage("Your reservation was successful!");
    } catch (error) {
      setModalMessage(
        error.response?.data || "An error occurred while submitting the request"
      );
    }
    setIsModalOpen(true);
    setIsLoading(false);
  };
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRequest({ ...request, [name]: value });
    setErrors({ ...errors, [name]: false });
  };

  const handleStartDateChange = (date) => {
    setRequest({ ...request, startDate: date });
    setErrors({ ...errors, startDate: false });
  };

  const handleEndDateChange = (date) => {
    setRequest({ ...request, endDate: date });
    setErrors({ ...errors, endDate: false });
  };

  const closeModalAndRefresh = () => {
    setIsModalOpen(false);
    window.location.reload(); // Refresh the page
  };

  return (
    <div className="pages">
      <div>
        <h1>Zahtjevi</h1>
        <p>Molimo Vas unesite podatke za zahtjev za vozilo.</p>
      </div>
      <div className="request-form-div">
        <h3>Ispunite formu:</h3>
        <form onSubmit={submitRequest}>

          <div>
            <h4>Odaberite veličinu vozila:</h4>
            <label>
              <input
                type="radio"
                name="carType"
                value="mini"
                checked={request.carType === "mini"}
                onChange={handleChange}
              />
              Mali auto (2 osobe + prtljaga)
            </label>
            <br />
            <label>
              <input
                type="radio"
                name="carType"
                value="standard"
                checked={request.carType === "standard"}
                onChange={handleChange}
              />
              Standardni auto (4-5 osoba + prtljaga)
            </label>
            <br />
            <label>
              <input
                type="radio"
                name="carType"
                value="minivan"
                checked={request.carType === "minivan"}
                onChange={handleChange}
              />
              Minivan (10 osoba + prtljaga)
            </label>
            {errors.carType && <p style={{ color: "red" }}>{errors.carType}</p>}
          </div>
          <div>
            <h4>Odaberite razlog zahtjeva:</h4>
            <label style={{ marginRight: "10px" }}>
              <input
                type="radio"
                name="reason"
                value="leasure"
                checked={request.reason === "leasure"}
                onChange={handleChange}
              />
              Osobni
            </label>
            <label>
              <input
                type="radio"
                name="reason"
                value="business"
                checked={request.reason === "business"}
                onChange={handleChange}
              />
              Poslovni
            </label>
            {errors.reason && <p style={{ color: "red" }}>{errors.reason}</p>}
          </div>
          <div>
            <h3>Odaberite početno i krajnje vrijeme</h3>
            <div className="start_end_date_picker_container">
              {/* Start Time */}
              <div>
                <label>Početno vrijeme:</label>
                <DatePicker
                  selected={request.startDate}
                  onChange={handleStartDateChange}
                  selectsStart
                  startDate={request.startDate}
                  endDate={request.endDate}
                  showTimeSelect
                  dateFormat="Pp"
                  placeholderText="Select start time"
                  minDate={currentDate} // Onemogućava prošli datum
                />
                {errors.startDate && (
                  <p style={{ color: "red" }}>{errors.startDate}</p>
                )}
              </div>

              {/* End Time */}
              <div>
                <label>Krajnje vrijeme:</label>
                <DatePicker
                  selected={request.endDate}
                  onChange={handleEndDateChange}
                  selectsEnd
                  startDate={request.startDate}
                  endDate={request.endDate}
                  minDate={request.startDate} // Osigurava da krajnji datum nije prije početnog
                  showTimeSelect
                  dateFormat="Pp"
                  placeholderText="Select end time"
                />
                {errors.endDate && (
                  <p style={{ color: "red" }}>{errors.endDate}</p>
                )}
              </div>
            </div>
          </div>

          <button type="submit" disabled={isLoading}>
  {isLoading ? "Submitting..." : "Podnesi zahtjev"}
</button>
        </form>
      </div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModalAndRefresh}
        className="modal"
      >
        <div>
          <h2>{modalMessage}</h2>
          <button onClick={closeModalAndRefresh}>Ok</button>
        </div>
      </Modal>
    </div>
  );
}
