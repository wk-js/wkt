"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../api");
class BoilerplateAPI extends api_1.API {
    init() { }
    bundle() { }
    helpers() {
        return {
            LocalAPI: this.LocalAPI,
            LocalStack: this.LocalStack,
            LocalStore: this.LocalStore,
            RootAPI: this.RootAPI,
            RootStack: this.RootStack,
            RootStore: this.RootStore,
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
    LocalStore(key, value) {
        return this.boilerplate.store(key, value);
    }
    RootStore(key, value) {
        return this.boilerplate.root.store(key, value);
    }
    output(str) {
        if (typeof str === 'string') {
            this.boilerplate.root.setOutput(str);
        }
        return this.boilerplate.root.dst_path;
    }
}
exports.BoilerplateAPI = BoilerplateAPI;
