import React from 'react';
import { NavLink } from 'react-router-dom'; // Use NavLink for active class
import ThemeToggle from './ThemeToggle';
import './NavBar.css';

const NavBar = () => {
    return (
        <nav className="navbar">
            <NavLink className="nav-brand" to="/">BAMS</NavLink>
            <div className="nav-links">
                <NavLink to="/">Dashboard</NavLink>
                <NavLink to="/blockchain-view">Blockchain</NavLink>
                <NavLink to="/departments">Departments</NavLink>
                <NavLink to="/classes">Classes</NavLink>
                <NavLink to="/students">Students</NavLink>
                <NavLink to="/attendance">Attendance</NavLink>
                <NavLink to="/stats">Stats</NavLink>
            </div>
            <ThemeToggle />
        </nav>
    );
};

export default NavBar;