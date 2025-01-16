import { useState } from "react";
import Register from "../components/Register";
// import AdminSignIn from "../components/AdminSignIn";
import SignIn from "../components/SignIn";

export default function HomePage() {
  const [signIn, setSignIn] = useState(true); // Initially show the sign-in form
  const [register, setRegister] = useState(false);
  const [admin, setAdmin] = useState(false);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <div
        className="cover-img"
        style={{
          backgroundImage: "url('src/assets/background.jpg')", // pozadina
          width: "100%",
          height: "200px",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <h1 style={{ textAlign: "center" }}>Fleet Management System</h1>
      </div>
      
      {/* Centered form */}
      <div style={{ width: "100%", maxWidth: "400px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        {signIn && <SignIn />} {/* Show sign-in form */}
      
        {signIn && (
          <p style={{ textAlign: "center" }}>
            Nemate korisnički račun?{" "}
            <span
              style={{ color: "black", cursor: "pointer" }}
              onClick={() => {
                setSignIn(false);
                setRegister(true);
              }}
            >
              Registrirajte se.
            </span>
          </p>
        )}

        {register && (
          <div>
            <p style={{ textAlign: "center" }}>
              <span
                style={{ color: "black", cursor: "pointer" }}
                onClick={() => {
                  setSignIn(true);
                  setRegister(false);
                }}
              >
                Prijavite se
              </span>
            </p>
            <Register /> {/* Show registration form */}
          </div>
        )}
      </div>

{/*       <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "20px",
          gap: "10px",
        }}
      >
        <button
          onClick={() => {
            setSignIn(false);
            setRegister(false);
            setAdmin(true);
          }}
        >
          Admin Sign in
        </button>
      </div> */}

{/*       <div style={{ display: "flex", justifyContent: "center" }}>
        {admin && <AdminSignIn />}
      </div> */}
    </div>
  );
}
