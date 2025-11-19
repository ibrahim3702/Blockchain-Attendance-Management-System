const DepartmentChain = require('../blockchain/DepartmentChain');
const ClassChain = require('../blockchain/ClassChain');
const StudentChain = require('../blockchain/StudentChain');
const Block = require('../blockchain/Block');
const uuid = (...args) => import("uuid").then(m => m.v4(...args));



const Department = require('../models/Department');
const Class = require('../models/Class');
const Student = require('../models/Student');

const DIFFICULTY = '0000';



/**
 * Gets the latest block from a chain in the DB
 * @param {mongoose.Model} Model - Department, Class, or Student
 * @param {string} idField - 'deptId', 'classId', or 'studentId'
 * @param {string} id - The ID of the document
 */
async function _getLatestBlock(Model, idField, id) {

    const doc = await Model.findOne(
        { [idField]: id },
        { chain: { $slice: -1 } }
    );

    if (!doc || !doc.chain || doc.chain.length === 0) {
        return null;
    }
    return doc.chain[0];
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
    block.mine(DIFFICULTY);


    await Model.updateOne(
        { [idField]: id },
        { $push: { chain: block } }
    );

    return block;
}


async function createDepartment(deptMeta) {
    const id = await uuid();
    const chain = new DepartmentChain(id, DIFFICULTY);
    const genesis = chain.createGenesis({ id, ...deptMeta });

    const newDept = new Department({
        deptId: id,
        name: deptMeta.name,
        status: 'active',
        createdAt: new Date(genesis.timestamp),

    });
    await newDept.save();


    return { id, chainId: `dept-${id}` };
}

async function updateDepartment(deptId, updateMeta) {
    const tx = { type: 'department_update', updateMeta };
    await _addBlockToChain(Department, 'deptId', deptId, [tx]);


    await Department.updateOne({ deptId }, { name: updateMeta.name });

    return { id: deptId, name: updateMeta.name };
}

async function deleteDepartment(deptId) {

    const childClasses = await Class.countDocuments({ parentDeptId: deptId, status: 'active' });
    if (childClasses > 0) {
        throw new Error(`Cannot delete department. It has ${childClasses} active class(es).`);
    }

    const tx = { type: 'department_delete', status: 'deleted' };
    await _addBlockToChain(Department, 'deptId', deptId, [tx]);


    await Department.updateOne({ deptId }, { status: 'deleted' });
    return { id: deptId, status: 'deleted' };
}

async function listDepartments() {

    const depts = await Department.find({ status: 'active' }, { chain: 0 }).lean();


    for (const dept of depts) {
        dept.classCount = await Class.countDocuments({ parentDeptId: dept.deptId, status: 'active' });
    }

    return depts.map(d => ({ ...d, id: d.deptId, chainId: `dept-${d.deptId}` }));
}


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
    await Student.updateOne({ studentId }, { ...updateMeta });
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


async function getChain(chainId) {

    if (typeof chainId !== 'string') return null;

    const dashIdx = chainId.indexOf('-');
    if (dashIdx <= 0) return null;

    const type = chainId.slice(0, dashIdx);
    const id = chainId.slice(dashIdx + 1);

    if (!id) return null;

    let doc = null;
    if (type === 'dept') {
        doc = await Department.findOne({ deptId: id }, { chain: 1 }).lean();
    } else if (type === 'class') {
        doc = await Class.findOne({ classId: id }, { chain: 1 }).lean();
    } else if (type === 'student') {
        doc = await Student.findOne({ studentId: id }, { chain: 1 }).lean();
    } else {
        return null;
    }

    return doc ? doc.chain : null;
}


async function findStudent(query) {
    const q = new RegExp(query, 'i');
    const students = await Student.find(
        { status: 'active', $or: [{ name: q }, { rollNo: q }] },
        { chain: 0 }
    ).lean();

    return students.map(s => ({ ...s, id: s.studentId, chainId: `student-${s.studentId}` }));
}


async function _getAllDocsForValidation() {
    const depts = await Department.find({}, { deptId: 1, chain: 1 }).lean();
    const classes = await Class.find({}, { classId: 1, parentDeptId: 1, chain: 1 }).lean();
    const students = await Student.find({}, { studentId: 1, parentClassId: 1, chain: 1 }).lean();
    return { depts, classes, students };
}

// --- System Statistics ---
async function getSystemStats() {
    // Entity counts
    const departmentCount = await Department.countDocuments({ status: 'active' });
    const classCount = await Class.countDocuments({ status: 'active' });
    const studentCount = await Student.countDocuments({ status: 'active' });

    // Blockchain metrics
    const allDepts = await Department.find({}).lean();
    const allClasses = await Class.find({}).lean();
    const allStudents = await Student.find({}).lean();

    let totalBlocks = 0;
    let totalChainLength = 0;
    let chainCount = 0;

    // Count blocks in all chains
    allDepts.forEach(dept => {
        if (dept.chain && dept.chain.length > 0) {
            totalBlocks += dept.chain.length;
            totalChainLength += dept.chain.length;
            chainCount++;
        }
    });

    allClasses.forEach(cls => {
        if (cls.chain && cls.chain.length > 0) {
            totalBlocks += cls.chain.length;
            totalChainLength += cls.chain.length;
            chainCount++;
        }
    });

    allStudents.forEach(stu => {
        if (stu.chain && stu.chain.length > 0) {
            totalBlocks += stu.chain.length;
            totalChainLength += stu.chain.length;
            chainCount++;
        }
    });

    const avgChainLength = chainCount > 0 ? totalChainLength / chainCount : 0;

    // Attendance statistics
    let totalAttendance = 0;
    let presentCount = 0;
    let absentCount = 0;
    let leaveCount = 0;

    allStudents.forEach(stu => {
        if (stu.chain && stu.chain.length > 0) {
            stu.chain.forEach(block => {
                if (block.transactions && block.transactions.length > 0) {
                    block.transactions.forEach(tx => {
                        if (tx.type === 'attendance_mark') {
                            totalAttendance++;
                            if (tx.status === 'Present') presentCount++;
                            else if (tx.status === 'Absent') absentCount++;
                            else if (tx.status === 'Leave') leaveCount++;
                        }
                    });
                }
            });
        }
    });

    const presentPercentage = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0;
    const absentPercentage = totalAttendance > 0 ? (absentCount / totalAttendance) * 100 : 0;
    const leavePercentage = totalAttendance > 0 ? (leaveCount / totalAttendance) * 100 : 0;

    return {
        entities: {
            departments: departmentCount,
            classes: classCount,
            students: studentCount,
        },
        blockchain: {
            totalBlocks,
            departmentChains: allDepts.length,
            classChains: allClasses.length,
            studentChains: allStudents.length,
            avgChainLength,
            difficulty: DIFFICULTY,
        },
        attendance: {
            totalRecords: totalAttendance,
            present: presentCount,
            absent: absentCount,
            leave: leaveCount,
            presentPercentage,
            absentPercentage,
            leavePercentage,
        },
    };
}

module.exports = {
    createDepartment, updateDepartment, deleteDepartment, listDepartments,
    createClass, updateClass, deleteClass, listClasses,
    createStudent, updateStudent, deleteStudent, listStudents,
    markAttendance,
    getChain,
    findStudent,
    getSystemStats,
    _getAllDocsForValidation,
    _getLatestBlock,
    Department,
    Class,
    Student,
};