"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../api");
const subprocess_1 = require("./subprocess");
class ExecAPI extends api_1.API {
    init() { }
    bundle() { }
    helpers() {
        return {
            exec: this.exec,
            execSync: this.execSync
        };
    }
    exec(command, options) {
        options = options || {};
        options.async = true;
        options.cwd = this.boilerplate.dst_path;
        return subprocess_1.Subprocess.execute(command, options);
    }
    execSync(command, options) {
        options = options || {};
        options.async = false;
        options.cwd = this.boilerplate.dst_path;
        return subprocess_1.Subprocess.execute(command, options);
    }
}
exports.ExecAPI = ExecAPI;
