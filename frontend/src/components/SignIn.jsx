import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import ReactModal from "react-modal";

export default function SignIn() {
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const navigate = useNavigate();

  const closeModal = () => {
    setModalIsOpen(false);
    setModalMessage("");
  };

  const submitUser = async (event) => {
    event.preventDefault();
    const { email, password } = user;
    const newErrors = {};
    if (!email) newErrors.email = true;
    if (!password) newErrors.password = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    try {
      const response = await axios.post("http://localhost:3000/login", user);
      localStorage.setItem("token", response.data);
      const decodedToken = jwtDecode(response.data);
      const { role } = decodedToken; // Dobivamo ulogu iz tokena

      // Ako je uloga "admin", preusmjeri na admin stranicu
      if (role === "admin") {
        navigate("/admin");
      } 
      // Ako je uloga "user", preusmjeri na stranicu za zaposlenike
      else if (role === "user") {
        navigate("/user");
      } else {
        setModalMessage("Invalid role");
        setModalIsOpen(true);
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 401) {
        setModalMessage("Invalid credentials. Please try again.");
        setModalIsOpen(true);
      } else {
        setModalMessage("An unexpected error occurred. Please try again later.");
        setModalIsOpen(true);
      }
    }
  };

  const changeInput = (event) => {
    const { name, value } = event.target;
    setUser({ ...user, [name]: value });
    setErrors({ ...errors, [name]: false });
  };

  return (
    <div>
      <h2>Prijava</h2>
      <form onSubmit={submitUser}>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={user.email}
          onChange={changeInput}
          style={{ borderColor: errors.email ? "red" : "" }}
        />
        <label htmlFor="password">Lozinka</label>
        <input
          type="password"
          id="password"
          name="password"
          value={user.password}
          onChange={changeInput}
          style={{ borderColor: errors.password ? "red" : "" }}
        />
        <button type="submit">Prijavi se</button>
      </form>

      <ReactModal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Error Modal"
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            color: "black",
          },
        }}
      >
        <h2>Greška!</h2>
        <p>{modalMessage}</p>
        <button onClick={closeModal}>Zatvori</button>
      </ReactModal>
    </div>
  );
}
