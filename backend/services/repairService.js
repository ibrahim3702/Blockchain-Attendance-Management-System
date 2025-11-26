const chainService = require('../services/chainService');
const DepartmentChain = require('../blockchain/DepartmentChain');
const ClassChain = require('../blockchain/ClassChain');
const StudentChain = require('../blockchain/StudentChain');

const DIFFICULTY = '0000';

/**
 * Repairs a department with an empty chain by creating a genesis block
 */
async function repairDepartmentChain(deptId) {
    const dept = await chainService.Department.findOne({ deptId });
    if (!dept) {
        throw new Error('Department not found');
    }

    // If chain already exists and has blocks, don't repair
    if (dept.chain && dept.chain.length > 0) {
        return { message: 'Chain is already valid', repaired: false };
    }

    // Create a new chain with genesis block
    const chain = new DepartmentChain(deptId, DIFFICULTY);
    const genesis = chain.createGenesis({ 
        id: deptId, 
        name: dept.name,
        status: dept.status 
    });

    // Update the department with the new chain
    await chainService.Department.updateOne(
        { deptId },
        { 
            chain: chain.chain,
            createdAt: new Date(genesis.timestamp)
        }
    );

    return { 
        message: 'Department chain repaired successfully', 
        repaired: true,
        deptId,
        chainLength: chain.chain.length
    };
}

/**
 * Repairs a class with an empty chain
 */
async function repairClassChain(classId) {
    const cls = await chainService.Class.findOne({ classId });
    if (!cls) {
        throw new Error('Class not found');
    }

    if (cls.chain && cls.chain.length > 0) {
        return { message: 'Chain is already valid', repaired: false };
    }

    // Get parent department's latest block hash
    const parentDept = await chainService.Department.findOne({ deptId: cls.parentDeptId });
    if (!parentDept || !parentDept.chain || parentDept.chain.length === 0) {
        throw new Error('Parent department has invalid chain');
    }
    const parentHash = parentDept.chain[parentDept.chain.length - 1].hash;

    // Create a new chain with genesis block
    const chain = new ClassChain(classId, parentHash, DIFFICULTY);
    const genesis = chain.createGenesis({ 
        id: classId,
        parentDeptId: cls.parentDeptId,
        name: cls.name,
        status: cls.status
    });

    await chainService.Class.updateOne(
        { classId },
        { 
            chain: chain.chain,
            createdAt: new Date(genesis.timestamp)
        }
    );

    return { 
        message: 'Class chain repaired successfully', 
        repaired: true,
        classId,
        chainLength: chain.chain.length
    };
}

/**
 * Repairs a student with an empty chain
 */
async function repairStudentChain(studentId) {
    const student = await chainService.Student.findOne({ studentId });
    if (!student) {
        throw new Error('Student not found');
    }

    if (student.chain && student.chain.length > 0) {
        return { message: 'Chain is already valid', repaired: false };
    }

    // Get parent class's latest block hash
    const parentClass = await chainService.Class.findOne({ classId: student.parentClassId });
    if (!parentClass || !parentClass.chain || parentClass.chain.length === 0) {
        throw new Error('Parent class has invalid chain');
    }
    const parentHash = parentClass.chain[parentClass.chain.length - 1].hash;

    // Create a new chain with genesis block
    const chain = new StudentChain(studentId, parentHash, DIFFICULTY);
    const genesis = chain.createGenesis({ 
        id: studentId,
        parentClassId: student.parentClassId,
        name: student.name,
        rollNo: student.rollNo,
        status: student.status
    });

    await chainService.Student.updateOne(
        { studentId },
        { 
            chain: chain.chain,
            createdAt: new Date(genesis.timestamp)
        }
    );

    return { 
        message: 'Student chain repaired successfully', 
        repaired: true,
        studentId,
        chainLength: chain.chain.length
    };
}

/**
 * Auto-repair all corrupted chains in the system
 */
async function repairAllChains() {
    const results = {
        departments: [],
        classes: [],
        students: [],
        summary: { repaired: 0, skipped: 0, errors: 0 }
    };

    // Repair departments
    const depts = await chainService.Department.find({});
    for (const dept of depts) {
        try {
            if (!dept.chain || dept.chain.length === 0) {
                const result = await repairDepartmentChain(dept.deptId);
                results.departments.push(result);
                if (result.repaired) results.summary.repaired++;
                else results.summary.skipped++;
            }
        } catch (err) {
            results.departments.push({ deptId: dept.deptId, error: err.message });
            results.summary.errors++;
        }
    }

    // Repair classes
    const classes = await chainService.Class.find({});
    for (const cls of classes) {
        try {
            if (!cls.chain || cls.chain.length === 0) {
                const result = await repairClassChain(cls.classId);
                results.classes.push(result);
                if (result.repaired) results.summary.repaired++;
                else results.summary.skipped++;
            }
        } catch (err) {
            results.classes.push({ classId: cls.classId, error: err.message });
            results.summary.errors++;
        }
    }

    // Repair students
    const students = await chainService.Student.find({});
    for (const student of students) {
        try {
            if (!student.chain || student.chain.length === 0) {
                const result = await repairStudentChain(student.studentId);
                results.students.push(result);
                if (result.repaired) results.summary.repaired++;
                else results.summary.skipped++;
            }
        } catch (err) {
            results.students.push({ studentId: student.studentId, error: err.message });
            results.summary.errors++;
        }
    }

    return results;
}

module.exports = {
    repairDepartmentChain,
    repairClassChain,
    repairStudentChain,
    repairAllChains
};
