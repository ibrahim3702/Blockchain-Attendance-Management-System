const ChainBase = require('./ChainBase');


class DepartmentChain extends ChainBase {
    constructor(deptId, difficultyPrefix) {
        super(`dept-${deptId}`, difficultyPrefix);
    }


    // create genesis block with department metadata
    createGenesis(deptMeta) {
        if (this.chain.length > 0) throw new Error('Genesis already created');
        const genesisTx = { type: 'department_genesis', deptMeta };
        return this.addBlock([genesisTx], '0');
    }
}


module.exports = DepartmentChain;