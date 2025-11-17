import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import BlockchainExplorer from '../components/BlockchainExplorer';

const StudentLedger = () => {
    const { chainId } = useParams();
    const [chain, setChain] = useState(null);
    const [student, setStudent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (chainId) {
            const fetchLedger = async () => {
                setIsLoading(true);
                try {

                    const res = await api.getStudentChain(chainId);
                    console.log(res);
                    setChain(res.data);


                    if (res.data && res.data.length > 0) {
                        const genesisTx = res.data[0].transactions[0];
                        if (genesisTx.type === 'student_genesis') {
                            setStudent(genesisTx.studentMeta);
                        }
                    }
                } catch (err) {
                    setError('Failed to load student ledger: ' + err.message);
                }
                setIsLoading(false);
            };
            fetchLedger();
        }
    }, [chainId]);

    return (
        <div className="page-container">
            <div className="page-header">
                {student ? (
                    <h1>Attendance Ledger: {student.name} ({student.rollNo})</h1>
                ) : (
                    <h1>Student Attendance Ledger</h1>
                )}
                <Link to="/students">
                    <button className="secondary">Back to Students</button>
                </Link>
            </div>

            <p>This is the complete, immutable attendance history for this student. Each block represents a genesis event, an update, or a daily attendance record, secured by Proof of Work.</p>

            {isLoading && <p>Loading ledger...</p>}
            {error && <p style={{ color: 'var(--danger-color)' }}>{error}</p>}

            <BlockchainExplorer chain={chain} />
        </div>
    );
};

export default StudentLedger;