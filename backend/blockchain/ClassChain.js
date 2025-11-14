const ChainBase = require('./ChainBase');


class ClassChain extends ChainBase {
    constructor(classId, parentDeptLatestHash, difficultyPrefix) {
        super(`class-${classId}`, difficultyPrefix);
        this.parentDeptLatestHash = parentDeptLatestHash; // required for genesis
    }


    createGenesis(classMeta) {
        if (this.chain.length > 0) throw new Error('Genesis already created');
        const tx = { type: 'class_genesis', classMeta };
        return this.addBlock([tx], this.parentDeptLatestHash);
    }
}


module.exports = ClassChain;