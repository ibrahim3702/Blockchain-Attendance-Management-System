import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Attendance = () => {
    const [departments, setDepartments] = useState([]);
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);

    const [selectedDept, setSelectedDept] = useState('');
    const [selectedClass, setSelectedClass] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // State to hold attendance data for each student
    // e.g., { "student-id-1": { status: "Present", notes: "" }, ... }
    const [attendanceData, setAttendanceData] = useState({});
    const [markingStatus, setMarkingStatus] = useState({}); // To show loading/success per row

    // Load departments on mount
    useEffect(() => {
        const fetchDepts = async () => {
            try {
                const res = await api.getDepts();
                setDepartments(res.data);
            } catch (err) { setError('Failed to load departments'); }
        };
        fetchDepts();
    }, []);

    // Load classes when department changes
    useEffect(() => {
        if (selectedDept) {
            const fetchClasses = async () => {
                try {
                    const res = await api.getClasses(selectedDept);
                    setClasses(res.data);
                } catch (err) { setError('Failed to load classes'); }
            };
            fetchClasses();
        }
        setSelectedClass('');
        setStudents([]);
        setAttendanceData({});
    }, [selectedDept]);

    // Load students when class changes
    useEffect(() => {
        if (selectedClass) {
            setIsLoading(true);
            const fetchStudents = async () => {
                try {
                    const res = await api.getStudents(selectedClass);
                    setStudents(res.data);
                    // Initialize attendance data
                    const initialData = {};
                    res.data.forEach(stu => {
                        initialData[stu.id] = { status: 'Present', notes: '' };
                    });
                    setAttendanceData(initialData);
                } catch (err) { setError('Failed to load students'); }
                setIsLoading(false);
            };
            fetchStudents();
        } else {
            setStudents([]);
            setAttendanceData({});
        }
    }, [selectedClass]);

    const handleAttendanceChange = (studentId, field, value) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [field]: value
            }
        }));
    };

    const handleMark = async (studentId) => {
        const data = attendanceData[studentId];
        if (!data.status) {
            alert('Please select a status (Present, Absent, or Leave).');
            return;
        }

        setMarkingStatus(prev => ({ ...prev, [studentId]: 'Marking...' }));

        try {
            await api.markAttendance({
                studentId,
                status: data.status,
                notes: data.notes
            });
            setMarkingStatus(prev => ({ ...prev, [studentId]: 'Marked ✔' }));
        } catch (err) {
            setMarkingStatus(prev => ({ ...prev, [studentId]: 'Error ✖' }));
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Mark Attendance</h1>
            </div>

            <div className="filter-controls">
                <div className="form-group">
                    <label>Select Department</label>
                    <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
                        <option value="">-- Select Department --</option>
                        {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Select Class</label>
                    <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} disabled={!selectedDept}>
                        <option value="">-- Select Class --</option>
                        {classes.map((cls) => (
                            <option key={cls.id} value={cls.id}>{cls.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {error && <p style={{ color: 'var(--danger-color)' }}>{error}</p>}
            {isLoading && <p>Loading students...</p>}

            <table>
                <thead>
                    <tr>
                        <th>Student Name</th>
                        <th>Roll No.</th>
                        <th>Status</th>
                        <th>Notes</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map((stu) => (
                        <tr key={stu.id}>
                            <td>{stu.name}</td>
                            <td>{stu.rollNo}</td>
                            <td>
                                <select
                                    value={attendanceData[stu.id]?.status || 'Present'}
                                    onChange={(e) => handleAttendanceChange(stu.id, 'status', e.target.value)}
                                >
                                    <option value="Present">Present</option>
                                    <option value="Absent">Absent</option>
                                    <option value="Leave">Leave</option>
                                </select>
                            </td>
                            <td>
                                <input
                                    type="text"
                                    placeholder="Optional notes..."
                                    value={attendanceData[stu.id]?.notes || ''}
                                    onChange={(e) => handleAttendanceChange(stu.id, 'notes', e.target.value)}
                                />
                            </td>
                            <td>
                                <button
                                    onClick={() => handleMark(stu.id)}
                                    disabled={!!markingStatus[stu.id] && markingStatus[stu.id] !== 'Error ✖'}
                                >
                                    {markingStatus[stu.id] || 'Mark'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Attendance;