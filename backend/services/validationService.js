const Block = require('../blockchain/Block');
const chainService = require('./chainService');

const DIFFICULTY = '0000';

/**
 * Validates a single chain's integrity.
 * Checks:
 * 1. Genesis block's prev_hash matches the expected parent hash.
 * 2. All subsequent block prev_hashes match the previous block's hash.
 * 3. All block hashes are valid (re-computed).
 * 4. All blocks satisfy the Proof of Work difficulty.
 */
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
                // This check is now only for internal consistency,
                // confirming the genesis hash is what we expect.
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

/**
 * Validates all chains in the hierarchy.
 */
async function validateAllChains() {
    const report = {
        valid: true,
        departments: [],
        summary: {
            totalInvalid: 0,
        }
    };

    const depts = chainService._readRegistry('departments.json');
    const classes = chainService._readRegistry('classes.json');
    const students = chainService._readRegistry('students.json');

    for (const dept of depts) {
        const deptReport = { id: dept.id, chainId: dept.chainId, valid: true, classes: [] };
        const deptChain = chainService._loadChainFile(dept.chainId);

        // 1. Validate Department Chain
        const deptValidation = _validateChain(deptChain, '0');
        if (!deptValidation.valid) {
            deptReport.valid = false;
            deptReport.reason = deptValidation.reason;
            report.valid = false;
            report.summary.totalInvalid++;
        }

        // --- NEW LOGIC: Create a set of all valid hashes in the parent chain ---
        const deptHashes = new Set(deptChain.map(b => b.hash));
        // --- END NEW LOGIC ---

        const childClasses = classes.filter(c => c.parentDeptId === dept.id);

        for (const cls of childClasses) {
            const classReport = { id: cls.id, chainId: cls.chainId, valid: true, students: [] };
            const classChain = chainService._loadChainFile(cls.chainId);

            if (!classChain || classChain.length === 0) {
                // Handle empty/missing chain file
                classReport.valid = false;
                classReport.reason = "Chain file not found or is empty.";
                report.valid = false;
                report.summary.totalInvalid++;
                deptReport.classes.push(classReport);
                continue; // Skip to next class
            }

            // 2. Validate Class Chain
            // --- START UPDATED VALIDATION LOGIC ---
            const classGenesisPrevHash = classChain[0].prev_hash;

            // 2a. Check if the genesis link exists ANYWHERE in the parent (department) chain
            if (!deptHashes.has(classGenesisPrevHash)) {
                classReport.valid = false;
                classReport.reason = "Genesis link broken. Parent department chain does not contain this hash.";
                report.valid = false;
                report.summary.totalInvalid++;
            } else {
                // 2b. If the link is historically valid, validate the class chain INTERNALLY
                // We pass its *own* expected genesis hash to confirm its integrity
                const classInternalValidation = _validateChain(classChain, classGenesisPrevHash);
                if (!classInternalValidation.valid) {
                    classReport.valid = false;
                    classReport.reason = `Internal chain invalid: ${classInternalValidation.reason}`;
                    report.valid = false;
                    report.summary.totalInvalid++;
                }
            }
            // --- END UPDATED VALIDATION LOGIC ---

            // Create a set of all valid hashes in this class chain for its children
            const classHashes = new Set(classChain.map(b => b.hash));
            const childStudents = students.filter(s => s.parentClassId === cls.id);

            for (const stu of childStudents) {
                const stuReport = { id: stu.id, chainId: stu.chainId, valid: true };
                const stuChain = chainService._loadChainFile(stu.chainId);

                if (!stuChain || stuChain.length === 0) {
                    stuReport.valid = false;
                    stuReport.reason = "Chain file not found or is empty.";
                    report.valid = false;
                    report.summary.totalInvalid++;
                    classReport.students.push(stuReport);
                    continue; // Skip to next student
                }

                // 3. Validate Student Chain (using the same new logic)
                const stuGenesisPrevHash = stuChain[0].prev_hash;

                // 3a. Check if the link exists ANYWHERE in the parent (class) chain
                if (!classHashes.has(stuGenesisPrevHash)) {
                    stuReport.valid = false;
                    stuReport.reason = "Genesis link broken. Parent class chain does not contain this hash.";
                    report.valid = false;
                    report.summary.totalInvalid++;
                } else {
                    // 3b. If the link is historically valid, validate the student chain INTERNALLY
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