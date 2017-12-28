"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const when_1 = require("when");
const subprocess_1 = require("./subprocess");
class ExecAPI extends __1.API {
    constructor() {
        super(...arguments);
        this.subprocesses = [];
    }
    init() { }
    bundle() {
        const subprocesses = this.subprocesses.map((sub) => {
            return () => sub.execute();
        });
        return when_1.reduce(subprocesses, (res, action) => action(), null).then(() => this.subprocesses = []);
    }
    helpers() {
        return {
            exec: this.exec,
            execSync: this.execSync
        };
    }
    exec(command, options) {
        options = options || {};
        options.async = true;
        options.cwd = this.boilerplate.output;
        const sub = subprocess_1.Subprocess.create(command, options);
        this.subprocesses.push(sub);
        return sub.promise;
    }
    execSync(command, options) {
        options = options || {};
        options.async = false;
        options.cwd = this.boilerplate.output;
        return subprocess_1.Subprocess.execute(command, options);
    }
}
exports.ExecAPI = ExecAPI;
