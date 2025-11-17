
const mongoose = require('mongoose');

const BlockSchema = new mongoose.Schema({
    index: { type: Number, required: true },
    transactions: { type: [Object], required: true },
    timestamp: { type: String, required: true },
    prev_hash: { type: String, required: true },
    nonce: { type: Number, required: true },
    hash: { type: String, required: true, index: true },
});

module.exports = BlockSchema;