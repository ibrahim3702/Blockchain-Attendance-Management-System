import React, { useState } from 'react';
import api from '../services/api';
import HierarchyExplorer from '../components/HierarchyExplorer';
import Blockchain3D from '../components/Blockchain3D';
import './Dashboard.css'; // We'll create this new CSS file

const Dashboard = () => {
    const [report, setReport] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [viewMode, setViewMode] = useState('3D'); // Toggle state

    const handleValidate = async () => {
        setIsLoading(true);
        setError('');
        setReport(null);
        try {
            const res = await api.validateChains();
            setReport(res.data);
        } catch (err) {
            setError('Failed to run validation: ' + err.message);
        }
        setIsLoading(false);
    };

    return (
        <div className="page-container dashboard-page">
            <div className="page-header">
                <h1>Dashboard</h1>
                {/* View Toggle Button Group */}
                <div className="view-toggle">
                    <button
                        className={viewMode === '3D' ? 'active' : ''}
                        onClick={() => setViewMode('3D')}
                    >
                        3D View
                    </button>
                    <button
                        className={viewMode === 'list' ? 'active' : ''}
                        onClick={() => setViewMode('list')}
                    >
                        List View
                    </button>
                </div>
            </div>

            {/* --- Visualization Section --- */}
            <div className="dashboard-section glass-card">
                <div className="section-header">
                    <h2>Blockchain Hierarchy</h2>
                    <p className="muted">
                        Visualize the live blockchain network.
                        {viewMode === '3D'
                            ? " Click a node to inspect its chain."
                            : " Expand nodes to see child chains."}
                    </p>
                </div>
                {/* Conditional Rendering */}
                {viewMode === '3D' ? <Blockchain3D /> : <HierarchyExplorer />}
            </div>

            {/* --- Validation Section --- */}
            <div className="dashboard-section glass-card">
                <div className="section-header">
                    <h2>Chain Validation</h2>
                    <p className="muted">
                        Run a multi-level validation to verify the integrity of all chains and parent-child links.
                    </p>
                </div>
                <button
                    onClick={handleValidate}
                    disabled={isLoading}
                    className="secondary"
                    style={{ marginBottom: '20px' }}
                >
                    {isLoading ? 'Validating...' : 'Validate All Chains'}
                </button>

                {error && <p style={{ color: 'var(--danger-color)' }}>{error}</p>}

                {report && (
                    <div className="validation-report">
                        <h3>Validation Report</h3>
                        <p className={`report-status ${report.valid ? 'valid' : 'invalid'}`}>
                            Overall Status: {report.valid ? '✔ VALID' : '✖ INVALID'}
                        </p>
                        <pre>{JSON.stringify(report, null, 2)}</pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;