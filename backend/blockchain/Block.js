const crypto = require('crypto');


class Block {
    constructor(index, transactions, timestamp, prev_hash = '') {
        this.index = index;
        this.transactions = transactions; // array / payload
        this.timestamp = timestamp || new Date().toISOString();
        this.prev_hash = prev_hash;
        this.nonce = 0;
        this.hash = this.computeHash();
    }


    computeHash() {
        const data = this.index + this.timestamp + JSON.stringify(this.transactions) + this.prev_hash + this.nonce;
        return crypto.createHash('sha256').update(data).digest('hex');
    }


    mine(difficultyPrefix = '0000') {
        while (!this.hash.startsWith(difficultyPrefix)) {
            this.nonce++;
            this.hash = this.computeHash();
        }
        return this.hash;
    }
}


module.exports = Block;