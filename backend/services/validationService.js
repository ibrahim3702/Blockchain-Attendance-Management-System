const Block = require('../blockchain/Block');
const chainService = require('./chainService');

const DIFFICULTY = '0000';


function _validateChain(chainArray, expectedGenesisPrevHash) {
    if (!chainArray || chainArray.length === 0) {
        return { valid: false, reason: 'Chain is empty' };
    }

    for (let i = 0; i < chainArray.length; i++) {
        const blockData = chainArray[i];

        const tempBlock = new Block(blockData.index, blockData.transactions, blockData.timestamp, blockData.prev_hash);
        tempBlock.nonce = blockData.nonce;

        if (tempBlock.computeHash() !== blockData.hash) {
            return { valid: false, blockIndex: i, reason: 'Hash mismatch' };
        }

        if (!blockData.hash.startsWith(DIFFICULTY)) {
            return { valid: false, blockIndex: i, reason: 'Proof of Work failed' };
        }

        if (i === 0) {
            if (blockData.prev_hash !== expectedGenesisPrevHash) {

                return { valid: false, blockIndex: 0, reason: 'Genesis block prev_hash mismatch' };
            }
        } else {
            if (blockData.prev_hash !== chainArray[i - 1].hash) {
                return { valid: false, blockIndex: i, reason: 'Internal chain link broken (prev_hash mismatch)' };
            }
        }
    }
    return { valid: true };
}


async function validateAllChains() {
    const report = {
        valid: true,
        departments: [],
        summary: { totalInvalid: 0 }
    };

    const { depts, classes, students } = await chainService._getAllDocsForValidation();

    for (const dept of depts) {
        const deptReport = { id: dept.deptId, chainId: `dept-${dept.deptId}`, valid: true, classes: [] };
        const deptChain = dept.chain;


        const deptValidation = _validateChain(deptChain, '0');
        if (!deptValidation.valid) {
            deptReport.valid = false;
            deptReport.reason = deptValidation.reason;
            report.valid = false;
            report.summary.totalInvalid++;
        }

        const deptHashes = new Set(deptChain.map(b => b.hash));
        const childClasses = classes.filter(c => c.parentDeptId === dept.deptId);

        for (const cls of childClasses) {
            const classReport = { id: cls.classId, chainId: `class-${cls.classId}`, valid: true, students: [] };
            const classChain = cls.chain;

            if (!classChain || classChain.length === 0) {
                classReport.valid = false;
                classReport.reason = "Chain is empty.";
                report.valid = false;
                report.summary.totalInvalid++;
                deptReport.classes.push(classReport);
                continue;
            }


            const classGenesisPrevHash = classChain[0].prev_hash;
            if (!deptHashes.has(classGenesisPrevHash)) {
                classReport.valid = false;
                classReport.reason = "Genesis link broken. Parent department chain does not contain this hash.";
                report.valid = false;
                report.summary.totalInvalid++;
            } else {
                const classInternalValidation = _validateChain(classChain, classGenesisPrevHash);
                if (!classInternalValidation.valid) {
                    classReport.valid = false;
                    classReport.reason = `Internal chain invalid: ${classInternalValidation.reason}`;
                    report.valid = false;
                    report.summary.totalInvalid++;
                }
            }

            const classHashes = new Set(classChain.map(b => b.hash));
            const childStudents = students.filter(s => s.parentClassId === cls.classId);

            for (const stu of childStudents) {
                const stuReport = { id: stu.studentId, chainId: `student-${stu.studentId}`, valid: true };
                const stuChain = stu.chain;

                if (!stuChain || stuChain.length === 0) {
                    stuReport.valid = false;
                    stuReport.reason = "Chain is empty.";
                    report.valid = false;
                    report.summary.totalInvalid++;
                    classReport.students.push(stuReport);
                    continue;
                }

                // 3. Validate Student Chain
                const stuGenesisPrevHash = stuChain[0].prev_hash;
                if (!classHashes.has(stuGenesisPrevHash)) {
                    stuReport.valid = false;
                    stuReport.reason = "Genesis link broken. Parent class chain does not contain this hash.";
                    report.valid = false;
                    report.summary.totalInvalid++;
                } else {
                    const stuInternalValidation = _validateChain(stuChain, stuGenesisPrevHash);
                    if (!stuInternalValidation.valid) {
                        stuReport.valid = false;
                        stuReport.reason = `Internal chain invalid: ${stuInternalValidation.reason}`;
                        report.valid = false;
                        report.summary.totalInvalid++;
                    }
                }
                classReport.students.push(stuReport);
            }
            deptReport.classes.push(classReport);
        }
        report.departments.push(deptReport);
    }

    return report;
}
module.exports = { validateAllChains, _validateChain };