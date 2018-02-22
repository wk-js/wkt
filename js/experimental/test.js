"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class API {
    store(key, value) {
        return this.boilerplate.store(key, value);
    }
    shared_store(key, value) {
        return this.boilerplate.root.store(key, value);
    }
    static create(options) {
        return new API;
    }
}
exports.API = API;
