const DepartmentChain = require('../blockchain/DepartmentChain');
const ClassChain = require('../blockchain/ClassChain');
const StudentChain = require('../blockchain/StudentChain');
const Block = require('../blockchain/Block');
const uuid = (...args) => import("uuid").then(m => m.v4(...args));


// Import Mongoose models (replaces all 'fs' and 'dataService' logic)
const Department = require('../models/Department');
const Class = require('../models/Class');
const Student = require('../models/Student');

const DIFFICULTY = '0000';

// --- Mongoose Helper Functions ---

/**
 * Gets the latest block from a chain in the DB
 * @param {mongoose.Model} Model - Department, Class, or Student
 * @param {string} idField - 'deptId', 'classId', or 'studentId'
 * @param {string} id - The ID of the document
 */
async function _getLatestBlock(Model, idField, id) {
    // Find the doc and return only the last element of the 'chain' array
    const doc = await Model.findOne(
        { [idField]: id },
        { chain: { $slice: -1 } } // Efficiently get only the last block
    );

    if (!doc || !doc.chain || doc.chain.length === 0) {
        return null;
    }
    return doc.chain[0]; // $slice: -1 returns an array, get first element
}

/**
 * Appends a new block to a chain in the DB
 * @param {mongoose.Model} Model - Department, Class, or Student
 * @param {string} idField - 'deptId', 'classId', or 'studentId'
 * @param {string} id - The ID of the document
 * @param {Object} transactions - The transactions for the new block
 */
async function _addBlockToChain(Model, idField, id, transactions) {
    const latestBlock = await _getLatestBlock(Model, idField, id);
    if (!latestBlock) throw new Error(`Chain for ${idField} ${id} not found or is empty.`);

    const newIndex = latestBlock.index + 1;
    const block = new Block(newIndex, transactions, new Date().toISOString(), latestBlock.hash);
    block.mine(DIFFICULTY); // Proof of Work

    // Push the new block to the chain array
    await Model.updateOne(
        { [idField]: id },
        { $push: { chain: block } }
    );

    return block;
}

// --- Department APIs ---
async function createDepartment(deptMeta) {
    const id = await uuid();
    const chain = new DepartmentChain(id, DIFFICULTY);
    const genesis = chain.createGenesis({ id, ...deptMeta });

    const newDept = new Department({
        deptId: id,
        name: deptMeta.name,
        status: 'active',
        createdAt: new Date(genesis.timestamp),
        chain: chain.chain, // Save the whole chain (just genesis block)
    });
    await newDept.save();

    // 'chainId' is a concept for the frontend, not the DB
    return { id, chainId: `dept-${id}` };
}

async function updateDepartment(deptId, updateMeta) {
    const tx = { type: 'department_update', updateMeta };
    await _addBlockToChain(Department, 'deptId', deptId, [tx]);

    // Update the query-friendly 'name' field
    await Department.updateOne({ deptId }, { name: updateMeta.name });

    return { id: deptId, name: updateMeta.name };
}

async function deleteDepartment(deptId) {
    // Check for child classes
    const childClasses = await Class.countDocuments({ parentDeptId: deptId, status: 'active' });
    if (childClasses > 0) {
        throw new Error(`Cannot delete department. It has ${childClasses} active class(es).`);
    }

    const tx = { type: 'department_delete', status: 'deleted' };
    await _addBlockToChain(Department, 'deptId', deptId, [tx]);

    // Mark as deleted
    await Department.updateOne({ deptId }, { status: 'deleted' });
    return { id: deptId, status: 'deleted' };
}

async function listDepartments() {
    // Find all active depts, but don't return the 'chain' field to keep it light
    const depts = await Department.find({ status: 'active' }, { chain: 0 }).lean();

    // Get class counts
    for (const dept of depts) {
        dept.classCount = await Class.countDocuments({ parentDeptId: dept.deptId, status: 'active' });
    }
    // Map DB fields to frontend-expected fields
    return depts.map(d => ({ ...d, id: d.deptId, chainId: `dept-${d.deptId}` }));
}

// --- Class APIs ---
async function createClass(classMeta, parentDeptId) {
    const parentLatestBlock = await _getLatestBlock(Department, 'deptId', parentDeptId);
    if (!parentLatestBlock) throw new Error('Parent department chain is empty or not found');
    const parentHash = parentLatestBlock.hash;

    const id = await uuid();
    const chain = new ClassChain(id, parentHash, DIFFICULTY);
    const genesis = chain.createGenesis({ id, parentDeptId, ...classMeta });

    const newClass = new Class({
        classId: id,
        name: classMeta.name,
        parentDeptId: parentDeptId,
        status: 'active',
        createdAt: new Date(genesis.timestamp),
        chain: chain.chain,
    });
    await newClass.save();

    return { id, chainId: `class-${id}` };
}

async function updateClass(classId, updateMeta) {
    const tx = { type: 'class_update', updateMeta };
    await _addBlockToChain(Class, 'classId', classId, [tx]);
    await Class.updateOne({ classId }, { name: updateMeta.name });
    return { id: classId, name: updateMeta.name };
}

async function deleteClass(classId) {
    const childStudents = await Student.countDocuments({ parentClassId: classId, status: 'active' });
    if (childStudents > 0) {
        throw new Error(`Cannot delete class. It has ${childStudents} active student(s).`);
    }

    const tx = { type: 'class_delete', status: 'deleted' };
    await _addBlockToChain(Class, 'classId', classId, [tx]);
    await Class.updateOne({ classId }, { status: 'deleted' });
    return { id: classId, status: 'deleted' };
}

async function listClasses(parentDeptId) {
    const filter = { status: 'active' };
    if (parentDeptId) {
        filter.parentDeptId = parentDeptId;
    }

    const classes = await Class.find(filter, { chain: 0 }).lean();

    for (const cls of classes) {
        cls.studentCount = await Student.countDocuments({ parentClassId: cls.classId, status: 'active' });
    }
    return classes.map(c => ({ ...c, id: c.classId, chainId: `class-${c.classId}` }));
}

// --- Student APIs ---
async function createStudent(studentMeta, parentClassId) {
    const parentLatestBlock = await _getLatestBlock(Class, 'classId', parentClassId);
    if (!parentLatestBlock) throw new Error('Parent class chain is empty or not found');
    const parentHash = parentLatestBlock.hash;

    const id = await uuid();
    const chain = new StudentChain(id, parentHash, DIFFICULTY);
    const genesis = chain.createGenesis({ id, parentClassId, ...studentMeta });

    const newStudent = new Student({
        studentId: id,
        name: studentMeta.name,
        rollNo: studentMeta.rollNo,
        parentClassId: parentClassId,
        status: 'active',
        createdAt: new Date(genesis.timestamp),
        chain: chain.chain,
    });
    await newStudent.save();

    return { id, chainId: `student-${id}` };
}

async function updateStudent(studentId, updateMeta) {
    const tx = { type: 'student_update', updateMeta };
    await _addBlockToChain(Student, 'studentId', studentId, [tx]);
    await Student.updateOne({ studentId }, { ...updateMeta }); // Update top-level fields
    return { id: studentId, ...updateMeta };
}

async function deleteStudent(studentId) {
    const tx = { type: 'student_delete', status: 'deleted' };
    await _addBlockToChain(Student, 'studentId', studentId, [tx]);
    await Student.updateOne({ studentId }, { status: 'deleted' });
    return { id: studentId, status: 'deleted' };
}

async function listStudents(parentClassId) {
    const filter = { status: 'active' };
    if (parentClassId) {
        filter.parentClassId = parentClassId;
    }

    const students = await Student.find(filter, { chain: 0 }).lean();
    return students.map(s => ({ ...s, id: s.studentId, chainId: `student-${s.studentId}` }));
}

// --- Attendance APIs ---
async function markAttendance(studentId, attData) {
    const stu = await Student.findOne({ studentId }, { parentClassId: 1 }).lean();
    if (!stu) throw new Error('Student not found');

    const tx = {
        type: 'attendance_mark',
        studentId,
        classId: stu.parentClassId,
        ...attData
    };

    const block = await _addBlockToChain(Student, 'studentId', studentId, [tx]);
    return block;
}

// --- Chain Data API ---
async function getChain(chainId) {
    // chainId is a string like "dept-uuid", "class-uuid", or "student-uuid"
    const [type, id] = chainId.split('-');

    let doc;
    if (type === 'dept') {
        doc = await Department.findOne({ deptId: id }, { chain: 1 }).lean();
    } else if (type === 'class') {
        doc = await Class.findOne({ classId: id }, { chain: 1 }).lean();
    } else if (type === 'student') {
        doc = await Student.findOne({ studentId: id }, { chain: 1 }).lean();
    }

    return doc ? doc.chain : null;
}

// --- Search APIs ---
async function findStudent(query) {
    const q = new RegExp(query, 'i'); // Case-insensitive regex
    const students = await Student.find(
        { status: 'active', $or: [{ name: q }, { rollNo: q }] },
        { chain: 0 }
    ).lean();

    return students.map(s => ({ ...s, id: s.studentId, chainId: `student-${s.studentId}` }));
}

// --- Expose functions for Validation Service ---
async function _getAllDocsForValidation() {
    const depts = await Department.find({}, { deptId: 1, chain: 1 }).lean();
    const classes = await Class.find({}, { classId: 1, parentDeptId: 1, chain: 1 }).lean();
    const students = await Student.find({}, { studentId: 1, parentClassId: 1, chain: 1 }).lean();
    return { depts, classes, students };
}

module.exports = {
    createDepartment, updateDepartment, deleteDepartment, listDepartments,
    createClass, updateClass, deleteClass, listClasses,
    createStudent, updateStudent, deleteStudent, listStudents,
    markAttendance,
    getChain,
    findStudent,
    _getAllDocsForValidation, // For validation
    _getLatestBlock, // For validation
    Department, // For validation
    Class, // For validation
    Student, // For validation
};