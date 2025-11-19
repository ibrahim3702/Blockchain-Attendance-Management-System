import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
    return (
        <div className="page-container dashboard-page">
            {/* Hero Section */}
            <div className="hero-section glass-card">
                <h1 className="hero-title">🎓 Blockchain Attendance Management System</h1>
                <p className="hero-subtitle">
                    Secure, transparent, and tamper-proof attendance tracking powered by blockchain technology
                </p>
            </div>

            {/* Feature Cards */}
            <div className="features-grid">
                <div className="feature-card glass-card">
                    <div className="feature-icon">⛓️</div>
                    <h3>Immutable Records</h3>
                    <p className="muted">
                        Every attendance record is secured with Proof-of-Work and stored permanently on the blockchain
                    </p>
                </div>
                <div className="feature-card glass-card">
                    <div className="feature-icon">�</div>
                    <h3>Full Transparency</h3>
                    <p className="muted">
                        View complete audit trails and verify the integrity of all records at any time
                    </p>
                </div>
                <div className="feature-card glass-card">
                    <div className="feature-icon">🏗️</div>
                    <h3>Hierarchical Structure</h3>
                    <p className="muted">
                        Organized in a three-tier architecture: Departments → Classes → Students
                    </p>
                </div>
                <div className="feature-card glass-card">
                    <div className="feature-icon">📊</div>
                    <h3>Real-time Analytics</h3>
                    <p className="muted">
                        Track attendance patterns and generate insights from blockchain data
                    </p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="dashboard-section glass-card">
                <div className="section-header">
                    <h2>🚀 Quick Actions</h2>
                    <p className="muted">Get started with common tasks</p>
                </div>
                <div className="quick-actions">
                    <Link to="/attendance">
                        <button>📝 Mark Attendance</button>
                    </Link>
                    <Link to="/blockchain-view">
                        <button className="secondary">⛓️ View Blockchain</button>
                    </Link>
                    <Link to="/students">
                        <button className="secondary">👥 Manage Students</button>
                    </Link>
                    <Link to="/departments">
                        <button className="secondary">🏫 Manage Departments</button>
                    </Link>
                    <Link to="/stats">
                        <button className="secondary">📊 View Statistics</button>
                    </Link>
                </div>
            </div>

            {/* Info Section */}
            <div className="info-section glass-card">
                <h3>How It Works</h3>
                <div className="info-steps">
                    <div className="step">
                        <div className="step-number">1</div>
                        <div className="step-content">
                            <h4>Create Hierarchy</h4>
                            <p>Set up departments, classes, and add students</p>
                        </div>
                    </div>
                    <div className="step">
                        <div className="step-number">2</div>
                        <div className="step-content">
                            <h4>Mark Attendance</h4>
                            <p>Record daily attendance for each student</p>
                        </div>
                    </div>
                    <div className="step">
                        <div className="step-number">3</div>
                        <div className="step-content">
                            <h4>Blockchain Security</h4>
                            <p>Each record is mined and added to the chain</p>
                        </div>
                    </div>
                    <div className="step">
                        <div className="step-number">4</div>
                        <div className="step-content">
                            <h4>Verify & Audit</h4>
                            <p>View complete history and validate integrity</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;