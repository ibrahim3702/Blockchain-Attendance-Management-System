import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Stats.css';

const Stats = () => {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [validationReport, setValidationReport] = useState(null);
    const [isValidating, setIsValidating] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setIsLoading(true);
        setError('');
        try {
            const res = await api.getStats();
            setStats(res.data);
        } catch (err) {
            setError('Failed to load statistics: ' + err.message);
        }
        setIsLoading(false);
    };

    const handleValidate = async () => {
        setIsValidating(true);
        setError('');
        try {
            const res = await api.validateChains();
            setValidationReport(res.data);
        } catch (err) {
            setError('Validation failed: ' + err.message);
        }
        setIsValidating(false);
    };

    if (isLoading) {
        return (
            <div className="page-container">
                <h1>Loading statistics...</h1>
            </div>
        );
    }

    if (error && !stats) {
        return (
            <div className="page-container">
                <h1>Statistics</h1>
                <p style={{ color: 'var(--danger-color)' }}>{error}</p>
                <button onClick={fetchStats}>Retry</button>
            </div>
        );
    }

    return (
        <div className="page-container stats-page">
            <div className="page-header">
                <h1>System Statistics</h1>
                <button onClick={fetchStats} className="secondary">
                    🔄 Refresh
                </button>
            </div>

            {error && <p style={{ color: 'var(--danger-color)' }}>{error}</p>}

            {/* Overview Cards */}
            <div className="stats-grid">
                {/* Entity Counts */}
                <div className="stat-card">
                    <div className="stat-icon">🏢</div>
                    <div className="stat-content">
                        <h3>Departments</h3>
                        <p className="stat-number">{stats?.entities?.departments || 0}</p>
                        <span className="stat-label">Active departments</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">📚</div>
                    <div className="stat-content">
                        <h3>Classes</h3>
                        <p className="stat-number">{stats?.entities?.classes || 0}</p>
                        <span className="stat-label">Active classes</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                        <h3>Students</h3>
                        <p className="stat-number">{stats?.entities?.students || 0}</p>
                        <span className="stat-label">Enrolled students</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <h3>Attendance Records</h3>
                        <p className="stat-number">{stats?.attendance?.totalRecords || 0}</p>
                        <span className="stat-label">Total marked</span>
                    </div>
                </div>
            </div>

            {/* Blockchain Stats */}
            <div className="stats-section glass-card">
                <h2>Blockchain Metrics</h2>
                <div className="blockchain-metrics">
                    <div className="metric-row">
                        <span className="metric-label">Total Blocks Mined</span>
                        <span className="metric-value">{stats?.blockchain?.totalBlocks || 0}</span>
                    </div>
                    <div className="metric-row">
                        <span className="metric-label">Department Chains</span>
                        <span className="metric-value">{stats?.blockchain?.departmentChains || 0}</span>
                    </div>
                    <div className="metric-row">
                        <span className="metric-label">Class Chains</span>
                        <span className="metric-value">{stats?.blockchain?.classChains || 0}</span>
                    </div>
                    <div className="metric-row">
                        <span className="metric-label">Student Chains</span>
                        <span className="metric-value">{stats?.blockchain?.studentChains || 0}</span>
                    </div>
                    <div className="metric-row">
                        <span className="metric-label">Average Chain Length</span>
                        <span className="metric-value">{stats?.blockchain?.avgChainLength?.toFixed(1) || '0.0'}</span>
                    </div>
                    <div className="metric-row">
                        <span className="metric-label">Mining Difficulty</span>
                        <span className="metric-value">{stats?.blockchain?.difficulty || 'N/A'}</span>
                    </div>
                </div>
            </div>

            {/* Attendance Analytics */}
            {stats?.attendance && (
                <div className="stats-section glass-card">
                    <h2>Attendance Analytics</h2>
                    <div className="attendance-breakdown">
                        <div className="attendance-stat">
                            <span className="attendance-label">Present</span>
                            <div className="attendance-bar">
                                <div
                                    className="attendance-fill present"
                                    style={{ width: `${stats.attendance.presentPercentage || 0}%` }}
                                ></div>
                            </div>
                            <span className="attendance-value">
                                {stats.attendance.present || 0} ({stats.attendance.presentPercentage?.toFixed(1) || 0}%)
                            </span>
                        </div>
                        <div className="attendance-stat">
                            <span className="attendance-label">Absent</span>
                            <div className="attendance-bar">
                                <div
                                    className="attendance-fill absent"
                                    style={{ width: `${stats.attendance.absentPercentage || 0}%` }}
                                ></div>
                            </div>
                            <span className="attendance-value">
                                {stats.attendance.absent || 0} ({stats.attendance.absentPercentage?.toFixed(1) || 0}%)
                            </span>
                        </div>
                        <div className="attendance-stat">
                            <span className="attendance-label">Leave</span>
                            <div className="attendance-bar">
                                <div
                                    className="attendance-fill leave"
                                    style={{ width: `${stats.attendance.leavePercentage || 0}%` }}
                                ></div>
                            </div>
                            <span className="attendance-value">
                                {stats.attendance.leave || 0} ({stats.attendance.leavePercentage?.toFixed(1) || 0}%)
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Chain Validation */}
            <div className="stats-section glass-card">
                <div className="section-header">
                    <h2>Chain Integrity</h2>
                    <button
                        onClick={handleValidate}
                        disabled={isValidating}
                        className="secondary"
                    >
                        {isValidating ? 'Validating...' : '🔍 Run Validation'}
                    </button>
                </div>

                {validationReport && (
                    <div className="validation-results">
                        <div className={`validation-status ${validationReport.valid ? 'valid' : 'invalid'}`}>
                            {validationReport.valid ? '✅ All chains are valid' : '❌ Validation errors detected'}
                        </div>
                        <div className="validation-details">
                            <div className="detail-row">
                                <span>Total Chains Checked:</span>
                                <span>{validationReport.totalChains || 0}</span>
                            </div>
                            <div className="detail-row">
                                <span>Valid Chains:</span>
                                <span className="success">{validationReport.validChains || 0}</span>
                            </div>
                            <div className="detail-row">
                                <span>Invalid Chains:</span>
                                <span className="danger">{validationReport.invalidChains || 0}</span>
                            </div>
                        </div>
                        {validationReport.errors && validationReport.errors.length > 0 && (
                            <details className="validation-errors">
                                <summary>View Errors ({validationReport.errors.length})</summary>
                                <pre>{JSON.stringify(validationReport.errors, null, 2)}</pre>
                            </details>
                        )}
                    </div>
                )}
            </div>

            {/* System Info */}
            <div className="stats-section glass-card">
                <h2>System Information</h2>
                <div className="system-info">
                    <div className="info-row">
                        <span className="info-label">Database Status</span>
                        <span className="info-value status-active">🟢 Connected</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Blockchain Version</span>
                        <span className="info-value">v1.0.0</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Consensus Algorithm</span>
                        <span className="info-value">Proof of Work</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Last Updated</span>
                        <span className="info-value">{new Date().toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Stats;
