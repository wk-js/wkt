"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const order_1 = require("../../stack/order");
class ChunkStack extends order_1.Order {
    constructor() {
        super(...arguments);
        this.chunks = {};
    }
    _addChunk(key, chunk) {
        this.chunks[key] = chunk || '';
    }
    add(key, chunk) {
        super.add(key);
        this._addChunk(key, chunk);
    }
    before(bfore, key, chunk) {
        super.before(bfore, key);
        this._addChunk(key, chunk);
    }
    after(after, key, chunk) {
        super.after(after, key);
        this._addChunk(key, chunk);
    }
    get(key) {
        const regex = new RegExp(`^${key}`);
        return this.order
            .filter((k) => {
            return k.match(regex);
        })
            .map((k) => {
            return this.chunks[k];
        })
            .join('\n');
    }
}
exports.ChunkStack = ChunkStack;
