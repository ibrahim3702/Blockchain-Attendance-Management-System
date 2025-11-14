// Import Mongoose models directly
const Department = require('../models/Department');
const Class = require('../models/Class');
const Student = require('../models/Student');

async function getFullHierarchy() {
    // 1. Fetch all active data from MongoDB
    // .lean() makes it fast by returning plain JS objects
    const depts = await Department.find({ status: 'active' }, { chain: 0 }).lean();
    const classes = await Class.find({ status: 'active' }, { chain: 0 }).lean();
    const students = await Student.find({ status: 'active' }, { chain: 0 }).lean();

    // 2. Use maps for efficient O(n) lookup
    const classMap = new Map();
    for (const cls of classes) {
        if (!classMap.has(cls.parentDeptId)) {
            classMap.set(cls.parentDeptId, []);
        }
        classMap.get(cls.parentDeptId).push(cls);
    }

    const studentMap = new Map();
    for (const stu of students) {
        if (!studentMap.has(stu.parentClassId)) {
            studentMap.set(stu.parentClassId, []);
        }
        studentMap.get(stu.parentClassId).push(stu);
    }

    // 3. Build the final tree using the correct DB field names
    const tree = depts.map(dept => {
        // Find children for this department
        const deptClasses = (classMap.get(dept.deptId) || []).map(cls => {
            // Find children for this class
            const classStudents = (studentMap.get(cls.classId) || []).map(stu => ({
                id: stu.studentId,
                name: stu.name,
                rollNo: stu.rollNo,
                chainId: `student-${stu.studentId}`,
                type: 'student'
            }));

            return {
                id: cls.classId,
                name: cls.name,
                chainId: `class-${cls.classId}`,
                type: 'class',
                children: classStudents
            };
        });

        return {
            id: dept.deptId,
            name: dept.name,
            chainId: `dept-${dept.deptId}`,
            type: 'department',
            children: deptClasses
        };
    });

    return tree;
}

module.exports = { getFullHierarchy };