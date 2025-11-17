const ChainBase = require('./ChainBase');


class StudentChain extends ChainBase {
    constructor(studentId, parentClassLatestHash, difficultyPrefix) {
        super(`student-${studentId}`, difficultyPrefix);
        this.parentClassLatestHash = parentClassLatestHash;
    }


    createGenesis(studentMeta) {
        if (this.chain.length > 0) throw new Error('Genesis already created');
        const tx = { type: 'student_genesis', studentMeta };
        return this.addBlock([tx], this.parentClassLatestHash);
    }


    addAttendance(attTx) {

        return this.addBlock([attTx]);
    }
}


module.exports = StudentChain;