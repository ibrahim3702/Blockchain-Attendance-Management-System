import React, { useState } from 'react';
import api from '../services/api';
import HierarchyExplorer from '../components/HierarchyExplorer';
import Blockchain3D from '../components/Blockchain3D';
import './BlockchainView.css';

const BlockchainView = () => {
    const [viewMode, setViewMode] = useState('3D'); // Toggle state
    const [report, setReport] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRepairing, setIsRepairing] = useState(false);
    const [error, setError] = useState('');
    const [repairResult, setRepairResult] = useState(null);

    const handleValidate = async () => {
        setIsLoading(true);
        setError('');
        setReport(null);
        setRepairResult(null);
        try {
            const res = await api.validateChains();
            setReport(res.data);
        } catch (err) {
            setError('Failed to run validation: ' + err.message);
        }
        setIsLoading(false);
    };

    const handleRepair = async () => {
        setIsRepairing(true);
        setError('');
        setRepairResult(null);
        try {
            const res = await api.repairAllChains();
            setRepairResult(res.data);
            // Re-run validation after repair
            setTimeout(() => handleValidate(), 1000);
        } catch (err) {
            setError('Failed to repair chains: ' + err.message);
        }
        setIsRepairing(false);
    };

    return (
        <div className="page-container blockchain-view-page">
            <div className="page-header">
                <h1>⛓️ Blockchain Visualization</h1>
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
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <button
                        onClick={handleValidate}
                        disabled={isLoading || isRepairing}
                        className="secondary"
                    >
                        {isLoading ? 'Validating...' : 'Validate All Chains'}
                    </button>
                    {report && !report.valid && (
                        <button
                            onClick={handleRepair}
                            disabled={isLoading || isRepairing}
                            style={{ background: 'linear-gradient(90deg, #f39c12, #f1c40f)' }}
                        >
                            {isRepairing ? 'Repairing...' : '🔧 Auto-Repair Chains'}
                        </button>
                    )}
                </div>

                {error && <p style={{ color: 'var(--danger-color)' }}>{error}</p>}

                {repairResult && (
                    <div className="validation-report" style={{ marginBottom: '20px', background: 'rgba(46, 204, 113, 0.1)' }}>
                        <h3>🔧 Repair Results</h3>
                        <p style={{ color: 'var(--success-color)' }}>
                            ✔ Repaired: {repairResult.summary.repaired} chains
                        </p>
                        {repairResult.summary.skipped > 0 && (
                            <p className="muted">Skipped: {repairResult.summary.skipped} (already valid)</p>
                        )}
                        {repairResult.summary.errors > 0 && (
                            <p style={{ color: 'var(--danger-color)' }}>
                                ⚠ Errors: {repairResult.summary.errors}
                            </p>
                        )}
                    </div>
                )}

                {report && (
                    <div className="validation-report">
                        <h3>Validation Report</h3>
                        <p className={`report-status ${report.valid ? 'valid' : 'invalid'}`}>
                            Overall Status: {report.valid ? '✔ VALID' : '✖ INVALID'}
                        </p>
                        {!report.valid && report.summary && (
                            <p style={{ color: 'var(--danger-color)', marginTop: '10px' }}>
                                Found {report.summary.totalInvalid} invalid chain(s). Click "Auto-Repair Chains" to fix.
                            </p>
                        )}
                        <pre>{JSON.stringify(report, null, 2)}</pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlockchainView;
