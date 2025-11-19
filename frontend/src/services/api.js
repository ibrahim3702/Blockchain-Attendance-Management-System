import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
console.log('Using API URL:', API_URL);

const api = axios.create({ baseURL: API_URL });

export const validateChains = () => api.get('/validate-all');
export const getHierarchyTree = () => api.get('/hierarchy/tree');
export const getDepts = () => api.get('/departments');
export const createDept = (data) => api.post('/departments', data);
export const updateDept = (id, data) => api.put(`/departments/${id}`, data);
export const deleteDept = (id) => api.delete(`/departments/${id}`);
export const getDeptChain = (chainId) => api.get(`/departments/${chainId}/chain`);

export const getClasses = (deptId = null) => {
    const params = deptId ? { deptId } : {};
    return api.get('/classes', { params });
};
export const createClass = (data) => api.post('/classes', data);
export const updateClass = (id, data) => api.put(`/classes/${id}`, data);
export const deleteClass = (id) => api.delete(`/classes/${id}`);
export const getClassChain = (chainId) => api.get(`/classes/${chainId}/chain`);

export const getStudents = (classId = null) => {
    const params = classId ? { classId } : {};
    return api.get('/students', { params });
};
export const searchStudents = (query) => api.get(`/students/search?q=${query}`);
export const createStudent = (data) => api.post('/students', data);
export const updateStudent = (id, data) => api.put(`/students/${id}`, data);
export const deleteStudent = (id) => api.delete(`/students/${id}`);
export const getStudentChain = (chainId) => api.get(`/students/${chainId}/chain`);


export const markAttendance = (data) => api.post('/attendance', data);

export const getStats = () => api.get('/stats');

const apiService = {
    validateChains,
    getDepts,
    createDept,
    updateDept,
    deleteDept,
    getDeptChain,
    getClasses,
    createClass,
    updateClass,
    deleteClass,
    getClassChain,
    getStudents,
    searchStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    getStudentChain,
    markAttendance,
    getStats,
    getHierarchyTree
};

export default apiService;