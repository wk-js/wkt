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
        if (!fn) {
            fn = key;
            this.boilerplate.stack.insert(fn);
            return;
        }
        this.boilerplate.stack.add(key, fn);
    }
    before(bfore, key, fn) {
        if (!fn) {
            fn = key;
            this.boilerplate.stack.insertBefore(bfore, fn);
            return;
        }
        this.boilerplate.stack.before(bfore, key, fn);
    }
    after(after, key, fn) {
        if (!fn) {
            fn = key;
            this.boilerplate.stack.insertAfter(after, fn);
            return;
        }
        this.boilerplate.stack.after(after, key, fn);
    }
    invocator() {
        return this.boilerplate.invocator.stack;
    }
}
exports.StackAPI = StackAPI;
