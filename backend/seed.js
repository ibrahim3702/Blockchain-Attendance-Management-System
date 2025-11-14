const chainService = require('./services/chainService');
const fs = require('fs');
const path = require('path');

async function clearData() {
    console.log('Clearing old data...');
    const dataDir = path.join(__dirname, 'data');
    const chainsDir = path.join(dataDir, 'chains');

    if (fs.existsSync(chainsDir)) {
        fs.rmSync(chainsDir, { recursive: true, force: true });
    }
    if (fs.existsSync(path.join(dataDir, 'departments.json'))) {
        fs.unlinkSync(path.join(dataDir, 'departments.json'));
    }
    if (fs.existsSync(path.join(dataDir, 'classes.json'))) {
        fs.unlinkSync(path.join(dataDir, 'classes.json'));
    }
    if (fs.existsSync(path.join(dataDir, 'students.json'))) {
        fs.unlinkSync(path.join(dataDir, 'students.json'));
    }
    console.log('Old data cleared.');
}

async function seed() {
    await clearData();
    console.log('Seeding database...');

    try {
        // 1. Create Departments
        const compDept = await chainService.createDepartment({ name: 'School of Computing' });
        const sweDept = await chainService.createDepartment({ name: 'School of Software Engineering' });
        console.log('Departments created.');

        // 2. Create Classes
        const compClass = await chainService.createClass({ name: 'CS101 - Intro to Blockchain' }, compDept.id);
        const sweClass = await chainService.createClass({ name: 'SWE404 - Secure Systems' }, sweDept.id);
        console.log('Classes created.');

        // 3. Create Students
        const stu1 = await chainService.createStudent({ name: 'Alice Smith', rollNo: 'CS-001' }, compClass.id);
        const stu2 = await chainService.createStudent({ name: 'Bob Johnson', rollNo: 'CS-002' }, compClass.id);
        const stu3 = await chainService.createStudent({ name: 'Charlie Lee', rollNo: 'SWE-001' }, sweClass.id);
        console.log('Students created.');

        // 4. Mark Attendance
        console.log('Marking attendance for Alice (CS-001)...');
        await chainService.markAttendance(stu1.id, { status: 'Present', notes: 'Day 1' });
        await chainService.markAttendance(stu1.id, { status: 'Present', notes: 'Day 2' });
        await chainService.markAttendance(stu1.id, { status: 'Absent', notes: 'Day 3' });

        console.log('Marking attendance for Bob (CS-002)...');
        await chainService.markAttendance(stu2.id, { status: 'Present', notes: 'Day 1' });
        await chainService.markAttendance(stu2.id, { status: 'Leave', notes: 'Day 2 - Sick' });

        console.log('Marking attendance for Charlie (SWE-001)...');
        await chainService.markAttendance(stu3.id, { status: 'Present', notes: 'Day 1' });
        console.log('Attendance marked.');

        // 5. Perform Update/Delete (to test append-only immutability)
        console.log('Updating Bob Johnson to Robert Johnson...');
        await chainService.updateStudent(stu2.id, { name: 'Robert Johnson' });

        console.log('Deleting SWE department (will be marked as deleted)...');
        await chainService.deleteDepartment(sweDept.id);

        console.log('Seeding complete!');

    } catch (err) {
        console.error('Seeding failed:', err.message);
    }
}

seed();