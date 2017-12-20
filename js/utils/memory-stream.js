"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const memStore = {};
class MemoryStream extends stream_1.Writable {
    constructor(key) {
        super();
        this.key = key;
        memStore[key] = new Buffer('');
    }
    _write(chunk, enc, cb) {
        const bf = Buffer.isBuffer(chunk) ? chunk : new Buffer(chunk);
        memStore[this.key] = Buffer.concat([memStore[this.key], bf]);
        cb();
    }
    getData(encoding) {
        return encoding ? memStore[this.key].toString(encoding) : memStore[this.key];
    }
    clean() {
        delete memStore[this.key];
    }
}
exports.MemoryStream = MemoryStream;
