"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
class StackAPI extends index_1.API {
    init() { }
    bundle() { }
    helpers() {
        return {
            add: this.add,
            before: this.before,
            after: this.after,
            invocator: this.invocator,
            output: this.output
        };
    }
    stack() {
        return this.boilerplate.stack;
    }
    add(key, fn) {
        this.boilerplate.stack.add(key, fn);
    }
    before(bfore, key, fn) {
        this.boilerplate.stack.before(bfore, key, fn);
    }
    after(after, key, fn) {
        this.boilerplate.stack.after(after, key, fn);
    }
    invocator() {
        return this.boilerplate.root.stack;
    }
    output(str) {
        if (typeof str === 'string') {
            this.boilerplate.root.output = str;
        }
        return this.boilerplate.root.output;
    }
}
exports.StackAPI = StackAPI;
