import React from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css';

const NavBar = () => {
    return (
        <nav className="navbar">
            <Link className="nav-brand" to="/">BAMS Dashboard</Link>
            <div className="nav-links">
                <Link to="/departments">Departments</Link>
                <Link to="/classes">Classes</Link>
                <Link to="/students">Students</Link>
                <Link to="/attendance">Mark Attendance</Link>
            </div>
        </nav>
    );
};

export default NavBar;