const DepartmentChain = require('../blockchain/DepartmentChain');
const ClassChain = require('../blockchain/ClassChain');
const StudentChain = require('../blockchain/StudentChain');
const Block = require('../blockchain/Block');
const { readJSON, writeJSON, DATA_DIR } = require('./dataService');
const fs = require('fs');
const path = require('path');
// const { v4: uuidv4 } = require('uuid');
const uuid = (...args) => import("uuid").then(m => m.v4(...args));

const DIFFICULTY = '0000';
const CHAINS_DIR = path.join(DATA_DIR, 'chains');
if (!fs.existsSync(CHAINS_DIR)) fs.mkdirSync(CHAINS_DIR, { recursive: true });

// --- Registry Helpers ---
function _readRegistry(name) { return readJSON(name); }
function _writeRegistry(name, arr) { writeJSON(name, arr); }

// --- Chain File Helpers ---
function _saveChainFile(chainId, chainArray) {
    if (!fs.existsSync(CHAINS_DIR)) {
        fs.mkdirSync(CHAINS_DIR, { recursive: true });
    }
    fs.writeFileSync(path.join(CHAINS_DIR, `${chainId}.json`), JSON.stringify(chainArray, null, 2));
}

function _loadChainFile(chainId) {
    const p = path.join(CHAINS_DIR, `${chainId}.json`);
    if (!fs.existsSync(p)) return null;
    const raw = fs.readFileSync(p, 'utf8');
    return JSON.parse(raw || '[]');
}

function _getLatestBlock(chainId) {
    const chain = _loadChainFile(chainId);
    if (!chain || chain.length === 0) return null;
    return chain[chain.length - 1];
}

// --- Generic Block Appender ---
/**
 * Loads a chain, creates a new block, mines it, appends it, and saves.
 * This is used for all UPDATE, DELETE, and ATTENDANCE actions.
 */
function _addBlockToChain(chainId, transactions) {
    const chainArray = _loadChainFile(chainId);
    if (!chainArray) throw new Error(`Chain ${chainId} not found.`);

    const latestBlock = chainArray[chainArray.length - 1];
    const newIndex = chainArray.length;

    const block = new Block(newIndex, transactions, new Date().toISOString(), latestBlock.hash);
    block.mine(DIFFICULTY); // Proof of Work

    chainArray.push(block);
    _saveChainFile(chainId, chainArray);

    return block;
}

// --- Department APIs ---
async function createDepartment(deptMeta) {
    const depts = _readRegistry('departments.json');
    const id = await uuid();

    const chainId = `dept-${id}`;

    const chain = new DepartmentChain(id, DIFFICULTY);
    const genesis = chain.createGenesis({ id, ...deptMeta });

    _saveChainFile(chainId, chain.chain);

    depts.push({ id, name: deptMeta.name, chainId: chainId, createdAt: genesis.timestamp, status: 'active' });
    _writeRegistry('departments.json', depts);

    return { id, chainId: chainId };
}

async function updateDepartment(deptId, updateMeta) {
    const depts = _readRegistry('departments.json');
    const dept = depts.find(d => d.id === deptId);
    if (!dept) throw new Error('Department not found');

    const tx = { type: 'department_update', updateMeta };
    _addBlockToChain(dept.chainId, [tx]);

    // Update registry for faster lookups
    dept.name = updateMeta.name || dept.name;
    _writeRegistry('departments.json', depts);
    return dept;
}

async function deleteDepartment(deptId) {
    // --- ADD THIS VALIDATION BLOCK ---
    const allSClasses = _readRegistry('classes.json');
    const childClasses = allSClasses.filter(c => c.parentDeptId === deptId && c.status !== 'deleted');

    if (childClasses.length > 0) {
        // This error message will be sent to the frontend
        throw new Error(`Cannot delete department. It has ${childClasses.length} active class(es). Please delete them first.`);
    }
    // --- END VALIDATION BLOCK ---

    const depts = _readRegistry('departments.json');
    const dept = depts.find(d => d.id === deptId);
    // ... (rest of the function is the same) ...
    if (!dept) throw new Error('Department not found');

    const tx = { type: 'department_delete', status: 'deleted' };
    _addBlockToChain(dept.chainId, [tx]);

    dept.status = 'deleted';
    _writeRegistry('departments.json', depts);
    return { id: deptId, status: 'deleted' };
}

async function listDepartments() {
    // --- MODIFY THIS FUNCTION ---
    const depts = _readRegistry('departments.json').filter(d => d.status !== 'deleted');
    const classes = _readRegistry('classes.json').filter(c => c.status !== 'deleted');

    // Add the classCount to each department object
    return depts.map(dept => {
        const classCount = classes.filter(c => c.parentDeptId === dept.id).length;
        return { ...dept, classCount };
    });
    // --- END MODIFICATION ---
}

// --- Class APIs ---
async function createClass(classMeta, parentDeptId) {
    const depts = _readRegistry('departments.json');
    const parentDept = depts.find(d => d.id === parentDeptId);
    if (!parentDept) throw new Error('Parent department not found');

    const parentHash = _getLatestBlock(parentDept.chainId).hash;
    if (!parentHash) throw new Error('Parent department chain is empty');

    const classes = _readRegistry('classes.json');
    const id = await uuid();

    const chainId = `class-${id}`;

    const chain = new ClassChain(id, parentHash, DIFFICULTY);
    const genesis = chain.createGenesis({ id, parentDeptId, ...classMeta });

    _saveChainFile(chainId, chain.chain);

    classes.push({ id, name: classMeta.name, parentDeptId, chainId, createdAt: genesis.timestamp, status: 'active' });
    _writeRegistry('classes.json', classes);

    return { id, chainId };
}

async function updateClass(classId, updateMeta) {
    const classes = _readRegistry('classes.json');
    const cls = classes.find(c => c.id === classId);
    if (!cls) throw new Error('Class not found');

    const tx = { type: 'class_update', updateMeta };
    _addBlockToChain(cls.chainId, [tx]);

    cls.name = updateMeta.name || cls.name;
    _writeRegistry('classes.json', classes);
    return cls;
}

async function deleteClass(classId) {
    // --- ADD THIS VALIDATION BLOCK ---
    const allStudents = _readRegistry('students.json');
    const childStudents = allStudents.filter(s => s.parentClassId === classId && s.status !== 'deleted');

    if (childStudents.length > 0) {
        throw new Error(`Cannot delete class. It has ${childStudents.length} active student(s). Please delete them first.`);
    }
    // --- END VALIDATION BLOCK ---

    const classes = _readRegistry('classes.json');
    const cls = classes.find(c => c.id === classId);
    // ... (rest of the function is the same) ...
    if (!cls) throw new Error('Class not found');

    const tx = { type: 'class_delete', status: 'deleted' };
    _addBlockToChain(cls.chainId, [tx]);

    cls.status = 'deleted';
    _writeRegistry('classes.json', classes);
    return { id: classId, status: 'deleted' };
}

async function listClasses(parentDeptId) {
    // --- MODIFY THIS FUNCTION ---
    let classes = _readRegistry('classes.json').filter(c => c.status !== 'deleted');
    const students = _readRegistry('students.json').filter(s => s.status !== 'deleted');

    if (parentDeptId) {
        classes = classes.filter(c => c.parentDeptId === parentDeptId);
    }

    // Add studentCount to each class object
    return classes.map(cls => {
        const studentCount = students.filter(s => s.parentClassId === cls.id).length;
        return { ...cls, studentCount };
    });
    // --- END MODIFICATION ---
}
// --- Student APIs ---
async function createStudent(studentMeta, parentClassId) {
    const classes = _readRegistry('classes.json');
    const parentClass = classes.find(c => c.id === parentClassId);
    if (!parentClass) throw new Error('Parent class not found');

    const parentHash = _getLatestBlock(parentClass.chainId).hash;
    if (!parentHash) throw new Error('Parent class chain is empty');

    const students = _readRegistry('students.json');
    const id = await uuid();

    const chainId = `student-${id}`;

    const chain = new StudentChain(id, parentHash, DIFFICULTY);
    const genesis = chain.createGenesis({ id, parentClassId, ...studentMeta });

    _saveChainFile(chainId, chain.chain);

    students.push({ id, name: studentMeta.name, rollNo: studentMeta.rollNo, parentClassId, chainId, createdAt: genesis.timestamp, status: 'active' });
    _writeRegistry('students.json', students);

    return { id, chainId };
}

async function updateStudent(studentId, updateMeta) {
    const students = _readRegistry('students.json');
    const stu = students.find(s => s.id === studentId);
    if (!stu) throw new Error('Student not found');

    const tx = { type: 'student_update', updateMeta };
    _addBlockToChain(stu.chainId, [tx]);

    stu.name = updateMeta.name || stu.name;
    stu.rollNo = updateMeta.rollNo || stu.rollNo;
    _writeRegistry('students.json', students);
    return stu;
}

async function deleteStudent(studentId) {
    const students = _readRegistry('students.json');
    const stu = students.find(s => s.id === studentId);
    if (!stu) throw new Error('Student not found');

    const tx = { type: 'student_delete', status: 'deleted' };
    _addBlockToChain(stu.chainId, [tx]);

    stu.status = 'deleted';
    _writeRegistry('students.json', students);
    return { id: studentId, status: 'deleted' };
}

async function listStudents(parentClassId) {
    let students = _readRegistry('students.json').filter(s => s.status !== 'deleted');
    if (parentClassId) {
        students = students.filter(s => s.parentClassId === parentClassId);
    }
    return students;
}

// --- Attendance APIs ---
async function markAttendance(studentId, attData) {
    // attData = { status: 'Present'/'Absent'/'Leave', notes: '...', markedBy: 'adminId' }
    const students = _readRegistry('students.json');
    const stu = students.find(s => s.id === studentId);
    if (!stu) throw new Error('Student not found');

    const tx = {
        type: 'attendance_mark',
        studentId,
        classId: stu.parentClassId,
        ...attData
    };

    const block = _addBlockToChain(stu.chainId, [tx]);
    return block;
}

// --- Chain Data API ---
async function getChain(chainId) {
    return _loadChainFile(chainId);
}

// --- Search APIs ---
async function findStudent(query) {
    const students = _readRegistry('students.json').filter(s => s.status !== 'deleted');
    const q = query.toLowerCase();
    return students.filter(s => s.name.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q));
}
// (Similar search functions can be added for depts and classes)

module.exports = {
    createDepartment, updateDepartment, deleteDepartment, listDepartments,
    createClass, updateClass, deleteClass, listClasses,
    createStudent, updateStudent, deleteStudent, listStudents,
    markAttendance,
    getChain,
    findStudent,
    _readRegistry, // exposed for validation service
    _loadChainFile, // exposed for validation service
    _getLatestBlock // exposed for validation service
};