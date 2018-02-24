"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("./api");
exports.BoilerplateAPI = api_1.API.extend('boilerplate', {
    helpers() {
        return {
            api: this.api,
            stack: this.stack,
            store: this.store,
            output: this.output
        };
    },
    methods: {
        getBoilerplate(type = 'local') {
            const bp = this.boilerplate;
            return type === 'local' ? bp : bp.root;
        },
        api(type = 'local') {
            return this.getBoilerplate(type).api.helpers;
        },
        stack(type = 'local') {
            return this.getBoilerplate(type).stack;
        },
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
        },
        output(str) {
            const bp = this.boilerplate;
            if (typeof str === 'string') {
                bp.root.setOutput(str);
            }
            return bp.root.dst_path;
        }
    }
});
