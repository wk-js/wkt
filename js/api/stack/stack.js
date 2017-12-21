"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
function getAPIClass() {
    return StackAPI;
}
exports.getAPIClass = getAPIClass;
class StackAPI extends index_1.API {
    init() { }
    bundle() { }
    helpers() {
        return {
            add: this.add,
            before: this.before,
            after: this.after,
            invocator: this.invocator
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
}
exports.StackAPI = StackAPI;
