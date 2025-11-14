import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';

const Departments = () => {
    const [departments, setDepartments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const [showModal, setShowModal] = useState(false);
    const [currentDept, setCurrentDept] = useState(null); // for editing
    const [formData, setFormData] = useState({ name: '' });

    const fetchDepartments = async () => {
        setIsLoading(true);
        try {
            const res = await api.getDepts();
            setDepartments(res.data);
        } catch (err) {
            setError('Failed to fetch departments');
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const handleOpenModal = (dept = null) => {
        setCurrentDept(dept);
        setFormData({ name: dept ? dept.name : '' });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentDept(null);
        setFormData({ name: '' });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentDept) {
                // Update
                await api.updateDept(currentDept.id, formData);
            } else {
                // Create
                await api.createDept(formData);
            }
            fetchDepartments(); // Refresh list
            handleCloseModal();
        } catch (err) {
            setError('Failed to save department');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure? This is irreversible and will be recorded on the blockchain.')) {
            try {
                await api.deleteDept(id);
                fetchDepartments(); // Refresh list
            } catch (err) {
                setError('Failed to delete department');
            }
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Manage Departments</h1>
                <button onClick={() => handleOpenModal()}>Add Department</button>
            </div>

            {error && <p style={{ color: 'var(--danger-color)' }}>{error}</p>}
            {isLoading && <p>Loading departments...</p>}

            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        {/* ADD THIS HEADER */}
                        <th>Active Classes</th>
                        <th>Chain ID</th>
                        <th>Created At</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {departments.map((dept) => (
                        <tr key={dept.id}>
                            <td>{dept.name}</td>
                            {/* ADD THIS CELL */}
                            <td>{dept.classCount}</td>
                            <td>{dept.chainId}</td>
                            <td>{new Date(dept.createdAt).toLocaleString()}</td>
                            <td className="actions">
                                <button className="secondary" onClick={() => handleOpenModal(dept)}>Edit</button>

                                {/* --- MODIFY THIS BUTTON --- */}
                                <button
                                    className="danger"
                                    onClick={() => handleDelete(dept.id)}
                                    disabled={dept.classCount > 0}
                                    title={
                                        dept.classCount > 0
                                            ? `Cannot delete: Department has ${dept.classCount} active class(es)`
                                            : 'Delete department'
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

            <Modal title={currentDept ? 'Edit Department' : 'Add Department'} show={showModal} onClose={handleCloseModal}>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Department Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit">Save Department</button>
                </form>
            </Modal>
        </div>
    );
};

export default Departments;