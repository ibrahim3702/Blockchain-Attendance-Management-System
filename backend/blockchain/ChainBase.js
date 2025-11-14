const Block = require('./Block');


class ChainBase {
    constructor(chainId, difficultyPrefix = '0000') {
        this.chainId = chainId; // unique id for the chain (dept:deptId, class:classId, student:studentId)
        this.difficultyPrefix = difficultyPrefix;
        this.chain = [];
    }


    latestBlock() {
        if (this.chain.length === 0) return null;
        return this.chain[this.chain.length - 1];
    }


    addBlock(transactions, prevHash = null) {
        const idx = this.chain.length;
        const prev_hash = prevHash !== null ? prevHash : (this.latestBlock() ? this.latestBlock().hash : '0');
        const block = new Block(idx, transactions, new Date().toISOString(), prev_hash);
        block.mine(this.difficultyPrefix);
        this.chain.push(block);
        return block;
    }


    isValid() {
        for (let i = 0; i < this.chain.length; i++) {
            const block = this.chain[i];
            if (block.hash !== block.computeHash()) return { valid: false, reason: `Block ${i} has invalid hash` };
            if (!block.hash.startsWith(this.difficultyPrefix)) return { valid: false, reason: `Block ${i} failed PoW` };
            if (i > 0 && block.prev_hash !== this.chain[i - 1].hash) return { valid: false, reason: `Block ${i} prev_hash mismatch` };
        }
        return { valid: true };
    }
}


module.exports = ChainBase;