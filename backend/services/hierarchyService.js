const { _readRegistry } = require('./chainService');

async function getFullHierarchy() {
    const depts = _readRegistry('departments.json').filter(d => d.status !== 'deleted');
    const classes = _readRegistry('classes.json').filter(c => c.status !== 'deleted');
    const students = _readRegistry('students.json').filter(s => s.status !== 'deleted');

    // Use maps for efficient O(n) lookup
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

    // Build the final tree
    const tree = depts.map(dept => {
        const deptClasses = (classMap.get(dept.id) || []).map(cls => {
            const classStudents = (studentMap.get(cls.id) || []).map(stu => ({
                id: stu.id,
                name: stu.name,
                rollNo: stu.rollNo,
                chainId: stu.chainId,
                type: 'student'
            }));

            return {
                id: cls.id,
                name: cls.name,
                chainId: cls.chainId,
                type: 'class',
                children: classStudents // Students
            };
        });

        return {
            id: dept.id,
            name: dept.name,
            chainId: dept.chainId,
            type: 'department',
            children: deptClasses // Classes
        };
    });

    return tree;
}

module.exports = { getFullHierarchy };