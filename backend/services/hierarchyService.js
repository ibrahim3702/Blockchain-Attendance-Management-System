
const Department = require('../models/Department');
const Class = require('../models/Class');
const Student = require('../models/Student');

async function getFullHierarchy() {

    const depts = await Department.find({ status: 'active' }, { chain: 0 }).lean();
    const classes = await Class.find({ status: 'active' }, { chain: 0 }).lean();
    const students = await Student.find({ status: 'active' }, { chain: 0 }).lean();


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


    const tree = depts.map(dept => {

        const deptClasses = (classMap.get(dept.deptId) || []).map(cls => {

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