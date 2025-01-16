import { useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";

export default function Register() {
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [errors, setErrors] = useState({});
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const navigate = useNavigate();

  const submitUser = async (event) => {
    event.preventDefault();
    const { name, email, password, role } = newUser;
    const newErrors = {};
    if (!name) newErrors.name = true;
    if (!email) newErrors.email = true;
    if (!password) newErrors.password = true;
    if (!role) newErrors.role = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // Registration
      await axios.post("http://localhost:3000/register", newUser);
      setModalMessage("Registration successful! Logging you in...");
      setModalIsOpen(true);

      // Wait for the user to click "Okay"
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Login
      const loginResponse = await axios.post("http://localhost:3000/login", {
        email,
        password,
      });
      localStorage.setItem("token", loginResponse.data);

      // Decode JWT and navigate based on role
      const decodedToken = jwtDecode(loginResponse.data);
      if (decodedToken.role === "admin") {
        navigate("/admin");
      } else if (decodedToken.role === "user") {
        navigate("/user");
      }
    } catch (error) {
      console.error(error);
      setModalMessage(
        error.response && error.response.status === 401
          ? "Invalid credentials. Please try again."
          : "An unexpected error occurred. Please try again later."
      );
      setModalIsOpen(true);
    }
  };

  const changeInput = (event) => {
    const { name, value } = event.target;
    setNewUser({ ...newUser, [name]: value });
    setErrors({ ...errors, [name]: false });
  };

  return (
    <div>
      <h2>Registracija</h2>
      <form onSubmit={submitUser}>
        <label htmlFor="name">Ime</label>
        <input
          type="text"
          id="name"
          name="name"
          value={newUser.name}
          onChange={changeInput}
          style={{ borderColor: errors.name ? "red" : "" }}
        />

        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={newUser.email}
          onChange={changeInput}
          style={{ borderColor: errors.email ? "red" : "" }}
        />

        <label htmlFor="password">Lozinka</label>
        <input
          type="password"
          id="password"
          name="password"
          value={newUser.password}
          onChange={changeInput}
          style={{ borderColor: errors.password ? "red" : "" }}
        />

        <label>Uloga</label>
        <div>
          <input
            type="radio"
            id="admin"
            name="role"
            value="admin"
            checked={newUser.role === "admin"}
            onChange={changeInput}
          />
          <label htmlFor="admin">Administrator</label>
        </div>
        <div>
          <input
            type="radio"
            id="user"
            name="role"
            value="user"
            checked={newUser.role === "user"}
            onChange={changeInput}
          />
          <label htmlFor="user">Zaposlenik</label>
        </div>

        <button type="submit">Registriraj se</button>
      </form>

      {/* Modal */}
      <Modal
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
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Message"
        ariaHideApp={false} // For accessibility
      >
        <p>{modalMessage}</p>
        <button onClick={() => setModalIsOpen(false)}>Okay</button>
      </Modal>
    </div>
  );
}
