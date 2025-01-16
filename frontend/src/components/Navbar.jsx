import { NavLink, Outlet } from "react-router-dom";
import "../Navbar.css";

const Navbar = () => {
  return (
    <div className="navbar-container">
      {/* Sidebar */}
      <nav className="sidebar">
        <NavLink to="/user" className="nav-link">
          Moji zahtjevi
        </NavLink>
        <NavLink to="/user/request-form" className="nav-link">
          Podnesi zahtjev
        </NavLink>
        
        <NavLink to="/user/report-damage" className="nav-link">
          Prijavi štetu
        </NavLink>
        <NavLink to="/" className="nav-link">
          Odjava
        </NavLink>
      </nav>
      <div className="content">
        {/* <div className="content"> */}
        <Outlet />
      </div>
    </div>
  );
};

export default Navbar;
