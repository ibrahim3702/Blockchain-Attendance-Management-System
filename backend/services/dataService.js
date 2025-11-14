const fs = require('fs');
const path = require('path');


const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });


function readJSON(filename) {
    const p = path.join(DATA_DIR, filename);
    if (!fs.existsSync(p)) return [];
    const raw = fs.readFileSync(p, 'utf8');
    return JSON.parse(raw || '[]');
}


function writeJSON(filename, obj) {
    const p = path.join(DATA_DIR, filename);
    fs.writeFileSync(p, JSON.stringify(obj, null, 2));
}


module.exports = { readJSON, writeJSON, DATA_DIR };