"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../api");
class BoilerplateAPI extends api_1.API {
    init() { }
    bundle() { }
    helpers() {
        return {
            api: this.api,
            stack: this.stack,
            store: this.store,
            output: this.output
        };
    }
    getBoilerplate(type = 'local') {
        return type === 'local' ? this.boilerplate : this.boilerplate.root;
    }
    api(type = 'local') {
        return this.getBoilerplate(type).api.helpers;
    }
    stack(type = 'local') {
        return this.getBoilerplate(type).stack;
    }
    store(type) {
        const bp = this.getBoilerplate(type);
        return {
            get: function (key) {
                return bp.store(key);
            },
            set: function (key, value) {
                return bp.store(key, value);
            }
        };
    }
    output(str) {
        if (typeof str === 'string') {
            this.boilerplate.root.setOutput(str);
        }
        return this.boilerplate.root.dst_path;
    }
}
exports.BoilerplateAPI = BoilerplateAPI;
