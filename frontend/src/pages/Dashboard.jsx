import React, { useState } from 'react';
import api from '../services/api';
import HierarchyExplorer from '../components/HierarchyExplorer';
import Blockchain3D from '../components/Blockchain3D'; // IMPORT THIS

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
        <div className="page-container">
            <div className="page-header">
                <h1>Dashboard</h1>
                {/* View Toggle Button */}
                <div>
                    <button
                        className={viewMode === 'list' ? 'secondary' : ''}
                        onClick={() => setViewMode('3D')}
                        style={{ marginRight: '10px' }}
                    >
                        3D View
                    </button>
                    <button
                        className={viewMode === '3D' ? 'secondary' : ''}
                        onClick={() => setViewMode('list')}
                    >
                        List View
                    </button>
                </div>
            </div>

            <p>Visualize the live blockchain network. Click on a node (Cube) to inspect its chain.</p>

            {/* Conditional Rendering */}
            {viewMode === '3D' ? <Blockchain3D /> : <HierarchyExplorer />}

            <div style={{ marginTop: '30px' }}>
                <h2>Chain Validation</h2>
                <button onClick={handleValidate} disabled={isLoading}>
                    {isLoading ? 'Validating...' : 'Validate All Chains'}
                </button>
                {error && <p style={{ color: 'var(--danger-color)' }}>{error}</p>}
                {report && (
                    <div style={{ marginTop: '20px' }}>
                        <h3>Validation Report</h3>
                        <p style={{ color: report.valid ? 'var(--success-color)' : 'var(--danger-color)', fontSize: '1.2rem', fontWeight: 'bold' }}>
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