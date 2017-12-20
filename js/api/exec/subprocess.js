"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const function_1 = require("lol/utils/function");
const child_process_1 = require("child_process");
const memory_stream_1 = require("../../utils/memory-stream");
const when = require("when");
let ID = 0;
function NOOP() { }
var SubprocessStatuses;
(function (SubprocessStatuses) {
    SubprocessStatuses["PENDING"] = "pending";
    SubprocessStatuses["PROCESSING"] = "processing";
    SubprocessStatuses["FAILED"] = "failed";
    SubprocessStatuses["COMPLETE"] = "complete";
})(SubprocessStatuses || (SubprocessStatuses = {}));
class Subprocess {
    constructor(command, options) {
        this.command = command;
        this.options = options;
        this.id = ID++;
        this.ps = null;
        this.resolve = NOOP;
        this.reject = NOOP;
        this.status = SubprocessStatuses.PENDING;
        function_1.bind(['execute', '_onError', '_onExit', '_onStdOutData', '_onStdErrData'], this);
        this.options = Object.assign({
            interactive: true,
            printStdout: true,
            printStderr: true,
            rejectOnError: false,
            encoding: 'utf-8',
            async: true
        }, this.options || {});
        if (this.options.async)
            this.prepare();
    }
    prepare() {
        this.promise = when.promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
            this.stdoutStream = new memory_stream_1.MemoryStream(`stdout_${this.id}`);
            this.stderrStream = new memory_stream_1.MemoryStream(`stderr_${this.id}`);
            this.streamPromise = when.all([
                when.promise((resolve) => { this.stdoutStream.on('finish', resolve); }),
                when.promise((resolve) => { this.stderrStream.on('finish', resolve); })
            ]);
        });
    }
    execute() {
        return (this.options.async) ? this.executeAsync() : this.executeSync();
    }
    executeSync() {
        if (this.status !== SubprocessStatuses.PENDING)
            return;
        this.status = SubprocessStatuses.PROCESSING;
        const opts = { env: this.options.env || {}, stdio: 'pipe', encoding: this.options.encoding };
        opts.env = Object.assign(opts.env, process.env);
        if (this.options.use_color) {
            opts.env.FORCE_COLOR = true;
        }
        if (this.options.interactive) {
            opts.stdio = 'inherit';
        }
        const cli = this.command.split(' ');
        return child_process_1.spawnSync(cli.shift(), cli, opts);
    }
    executeAsync() {
        if (this.status !== SubprocessStatuses.PENDING)
            return;
        this.status = SubprocessStatuses.PROCESSING;
        const opts = { env: this.options.env || {}, stdio: 'pipe' };
        opts.env = Object.assign(opts.env, process.env);
        if (this.options.use_color) {
            opts.env.FORCE_COLOR = true;
        }
        if (this.options.interactive) {
            opts.stdio = 'inherit';
        }
        const cli = this.command.split(' ');
        this.ps = child_process_1.spawn(cli.shift(), cli, opts);
        this.activate();
        return this.promise;
    }
    kill() {
        if (this.ps)
            this.ps.kill();
    }
    activate() {
        if (!this.ps)
            return;
        const ps = this.ps;
        ps.on('error', this._onError);
        ps.on('exit', this._onExit);
        if (ps.stdout) {
            ps.stdout.pipe(this.stdoutStream);
            ps.stdout.on('data', this._onStdOutData);
        }
        if (ps.stderr) {
            ps.stderr.pipe(this.stderrStream);
            ps.stderr.on('data', this._onStdErrData);
        }
    }
    desactivate() {
        if (!this.ps)
            return;
        const ps = this.ps;
        ps.removeListener('error', this._onError);
        ps.removeListener('exit', this._onExit);
        if (ps.stdout) {
            ps.stdout.unpipe(this.stdoutStream);
            ps.stdout.removeListener('data', this._onStdOutData);
        }
        if (ps.stderr) {
            ps.stderr.unpipe(this.stderrStream);
            ps.stderr.removeListener('data', this._onStdErrData);
        }
    }
    _onStdOutData(data) {
        if (this.options.printStdout) {
            console.log(data.toString('utf-8'));
        }
    }
    _onStdErrData(data) {
        if (this.options.printStderr) {
            console.log(data.toString('utf-8'));
        }
    }
    _onError(value) {
        if (this.status !== SubprocessStatuses.PROCESSING)
            return;
        let err;
        if (value) {
            if (value instanceof Error)
                err = value;
            else if (typeof value === 'string')
                err = new Error(value);
            else
                err = new Error(value.toString());
        }
        else {
            err = new Error();
        }
        this.kill();
    }
    _onExit(code, signal, err) {
        if (this.status !== SubprocessStatuses.PROCESSING)
            return;
        const scope = this;
        const ps = this.ps;
        const stdoutStream = this.stdoutStream;
        const stderrStream = this.stderrStream;
        const options = this.options;
        const resolve = this.resolve;
        const reject = this.reject;
        const response = {
            code: code,
            stdout: undefined,
            stderr: undefined,
            err: err
        };
        function finish(result) {
            if ((err || code !== 0) && options.rejectOnError) {
                scope.status = SubprocessStatuses.FAILED;
                console.log('Unexpected exit with code:', code);
                reject(result);
            }
            else {
                scope.status = SubprocessStatuses.COMPLETE;
                resolve(result);
            }
        }
        if (ps.stdout || ps.stderr) {
            // Wait stream finished
            scope.streamPromise.then(() => {
                response.stdout = stdoutStream.getData(options.encoding);
                response.stderr = stderrStream.getData(options.encoding);
                finish.call(null, response);
            });
            return;
        }
        finish.call(null, response);
    }
    static create(command, options) {
        return new Subprocess(command, options);
    }
    static execute(command, options) {
        const sub = new Subprocess(command, options);
        return sub.execute();
    }
}
exports.Subprocess = Subprocess;
