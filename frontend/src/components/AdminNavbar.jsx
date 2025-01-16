import { NavLink, Outlet } from "react-router-dom";
import "../Navbar.css";

const AdminNavbar = () => {
  return (
    <div className="navbar-container">
      {/* Sidebar */}
      <nav className="sidebar">
        <NavLink to="/admin" className="nav-link">
          Početna stranica
        </NavLink>
        <NavLink to="/admin/add-new-car" className="nav-link">
          Dodaj novo vozilo
        </NavLink>
        <NavLink to="/admin/damage-reports" className="nav-link">
          Kvarovi
        </NavLink>
        <NavLink to="/admin/cars" className="nav-link">
          Sva vozila
        </NavLink>
        <NavLink to="/" className="nav-link">
          Odjava
        </NavLink>
      </nav>

      <div className="content">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminNavbar;
