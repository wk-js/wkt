"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("./api");
const subprocess_1 = require("../api/exec/subprocess");
exports.ExecAPI = api_1.API.extend('exec', {
    helpers() {
        return {
            exec: this.exec,
            execSync: this.execSync
        };
    },
    methods: {
        exec(command, options) {
            options = options || {};
            options.async = true;
            options.cwd = this.boilerplate.dst_path;
            return subprocess_1.Subprocess.execute(command, options);
        },
        execSync(command, options) {
            options = options || {};
            options.async = false;
            options.cwd = this.boilerplate.dst_path;
            return subprocess_1.Subprocess.execute(command, options);
        }
    }
});
