import React, { useState } from 'react';
import api from '../services/api';

const Dashboard = () => {
    const [report, setReport] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

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
            </div>
            <p>Welcome to the Blockchain-Based Attendance Management System (BAMS).</p>

            <h2>Chain Validation</h2>
            <p>Click the button below to run a full, multi-level validation of all blockchains in the system. This will verify all hashes, Proof of Work, and parent-child chain links.</p>

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
                    <p>Total Invalid Chains Found: {report.summary.totalInvalid}</p>
                    <h4>Full Report:</h4>
                    <pre>
                        {JSON.stringify(report, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default Dashboard;