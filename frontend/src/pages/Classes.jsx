import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';

const Classes = () => {
    const [departments, setDepartments] = useState([]);
    const [classes, setClasses] = useState([]);
    const [selectedDept, setSelectedDept] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const [showModal, setShowModal] = useState(false);
    const [currentClass, setCurrentClass] = useState(null);
    const [formData, setFormData] = useState({ name: '' });

    useEffect(() => {
        // Fetch departments for the dropdown
        const fetchDepts = async () => {
            try {
                const res = await api.getDepts();
                setDepartments(res.data);
            } catch (err) {
                setError('Failed to load departments');
            }
        };
        fetchDepts();
    }, []);

    useEffect(() => {
        // Fetch classes when department changes
        if (selectedDept) {
            setIsLoading(true);
            const fetchClasses = async () => {
                try {
                    const res = await api.getClasses(selectedDept);
                    setClasses(res.data);
                } catch (err) {
                    setError('Failed to load classes for this department');
                }
                setIsLoading(false);
            };
            fetchClasses();
        } else {
            setClasses([]); // Clear classes if no dept is selected
        }
    }, [selectedDept]);

    const handleOpenModal = (cls = null) => {
        if (!selectedDept) {
            alert('Please select a department first.');
            return;
        }
        setCurrentClass(cls);
        setFormData({ name: cls ? cls.name : '' });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentClass(null);
        setFormData({ name: '' });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = { ...formData, parentDeptId: selectedDept };
            if (currentClass) {
                await api.updateClass(currentClass.id, data);
            } else {
                await api.createClass(data);
            }
            // Refresh list
            const res = await api.getClasses(selectedDept);
            setClasses(res.data);
            handleCloseModal();
        } catch (err) {
            setError('Failed to save class');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure? This will be recorded on the blockchain.')) {
            try {
                await api.deleteClass(id);
                // Refresh list
                const res = await api.getClasses(selectedDept);
                setClasses(res.data);
            } catch (err) {
                setError('Failed to delete class');
            }
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Manage Classes</h1>
                <button onClick={() => handleOpenModal()} disabled={!selectedDept}>
                    Add Class
                </button>
            </div>

            <div className="filter-controls">
                <div className="form-group">
                    <label htmlFor="department">Select Department</label>
                    <select id="department" value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
                        <option value="">-- Select a Department --</option>
                        {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {error && <p style={{ color: 'var(--danger-color)' }}>{error}</p>}
            {isLoading && <p>Loading classes...</p>}

            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        {/* ADD THIS HEADER */}
                        <th>Active Students</th>
                        <th>Chain ID</th>
                        <th>Created At</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {classes.map((cls) => (
                        <tr key={cls.id}>
                            <td>{cls.name}</td>
                            {/* ADD THIS CELL */}
                            <td>{cls.studentCount}</td>
                            <td>{cls.chainId}</td>
                            <td>{new Date(cls.createdAt).toLocaleString()}</td>
                            <td className="actions">
                                <button className="secondary" onClick={() => handleOpenModal(cls)}>Edit</button>

                                {/* --- MODIFY THIS BUTTON --- */}
                                <button
                                    className="danger"
                                    onClick={() => handleDelete(cls.id)}
                                    disabled={cls.studentCount > 0}
                                    title={
                                        cls.studentCount > 0
                                            ? `Cannot delete: Class has ${cls.studentCount} active student(s)`
                                            : 'Delete class'
                                    }
                                >
                                    Delete
                                </button>
                                {/* --- END MODIFICATION --- */}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <Modal title={currentClass ? 'Edit Class' : 'Add Class'} show={showModal} onClose={handleCloseModal}>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Class Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit">Save Class</button>
                </form>
            </Modal>
        </div>
    );
};

export default Classes;