"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
class StackAPI extends index_1.API {
    init() { }
    bundle() { }
    helpers() {
        return {
            stack: this.stack,
            invocator: this.invocator,
            output: this.output
        };
    }
    stack() {
        return this.boilerplate.stack;
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
