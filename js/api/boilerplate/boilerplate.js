"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../api");
class BoilerplateAPI extends api_1.API {
    init() { }
    bundle() { }
    helpers() {
        return {
            LocalAPI: this.LocalAPI,
            RootAPI: this.RootAPI,
            LocalStack: this.LocalStack,
            RootStack: this.RootStack,
            output: this.output
        };
    }
    LocalAPI() {
        return this.boilerplate.api.helpers;
    }
    RootAPI() {
        return this.boilerplate.root.api.helpers;
    }
    LocalStack() {
        return this.boilerplate.stack;
    }
    RootStack() {
        return this.boilerplate.root.stack;
    }
    output(str) {
        if (typeof str === 'string') {
            this.boilerplate.root.output = str;
        }
        return this.boilerplate.root.output;
    }
}
exports.BoilerplateAPI = BoilerplateAPI;
