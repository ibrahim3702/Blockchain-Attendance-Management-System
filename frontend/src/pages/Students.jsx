import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/Modal';

const Students = () => {
    const [departments, setDepartments] = useState([]);
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);

    const [selectedDept, setSelectedDept] = useState('');
    const [selectedClass, setSelectedClass] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Search
    const [searchQuery, setSearchQuery] = useState('');

    // Form state
    const [showModal, setShowModal] = useState(false);
    const [currentStudent, setCurrentStudent] = useState(null);
    const [formData, setFormData] = useState({ name: '', rollNo: '' });

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
    }, [selectedDept]);

    // Load students when class changes
    useEffect(() => {
        if (selectedClass) {
            setIsLoading(true);
            const fetchStudents = async () => {
                try {
                    const res = await api.getStudents(selectedClass);
                    setStudents(res.data);
                } catch (err) { setError('Failed to load students'); }
                setIsLoading(false);
            };
            fetchStudents();
        } else {
            setStudents([]);
        }
    }, [selectedClass]);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery) return;
        setIsLoading(true);
        try {
            const res = await api.searchStudents(searchQuery);
            setStudents(res.data);
            // Clear filters to show search results
            setSelectedDept('');
            setSelectedClass('');
        } catch (err) {
            setError('Search failed');
        }
        setIsLoading(false);
    };

    const handleOpenModal = (stu = null) => {
        if (!selectedClass) {
            alert('Please select a class first.');
            return;
        }
        setCurrentStudent(stu);
        setFormData({ name: stu ? stu.name : '', rollNo: stu ? stu.rollNo : '' });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentStudent(null);
        setFormData({ name: '', rollNo: '' });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = { ...formData, parentClassId: selectedClass };
            if (currentStudent) {
                await api.updateStudent(currentStudent.id, data);
            } else {
                await api.createStudent(data);
            }
            // Refresh list
            const res = await api.getStudents(selectedClass);
            setStudents(res.data);
            handleCloseModal();
        } catch (err) {
            setError('Failed to save student');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure? This will be recorded on the blockchain.')) {
            try {
                await api.deleteStudent(id);
                // Refresh list
                const res = await api.getStudents(selectedClass);
                setStudents(res.data);
            } catch (err) {
                setError('Failed to delete student');
            }
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Manage Students</h1>
                <button onClick={() => handleOpenModal()} disabled={!selectedClass}>
                    Add Student
                </button>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input
                    type="search"
                    placeholder="Search by name or roll no..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ flex: 1 }}
                />
                <button type="submit">Search</button>
            </form>

            {/* Filter Controls */}
            <div className="filter-controls">
                <div className="form-group">
                    <label>Filter by Department</label>
                    <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
                        <option value="">-- Select Department --</option>
                        {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Filter by Class</label>
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
                        <th>Name</th>
                        <th>Roll No.</th>
                        <th>Chain ID</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map((stu) => (
                        <tr key={stu.id}>
                            <td>{stu.name}</td>
                            <td>{stu.rollNo}</td>
                            <td>{stu.chainId}</td>
                            <td className="actions">
                                <Link to={`/student-ledger/${stu.chainId}`}>
                                    <button className="secondary">View Ledger</button>
                                </Link>
                                <button className="secondary" onClick={() => handleOpenModal(stu)}>Edit</button>
                                <button className="danger" onClick={() => handleDelete(stu.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <Modal title={currentStudent ? 'Edit Student' : 'Add Student'} show={showModal} onClose={handleCloseModal}>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Student Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Roll Number</label>
                        <input type="text" name="rollNo" value={formData.rollNo} onChange={handleChange} required />
                    </div>
                    <button type="submit">Save Student</button>
                </form>
            </Modal>
        </div>
    );
};

export default Students;