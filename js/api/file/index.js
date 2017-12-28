"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const when_1 = require("when");
const function_1 = require("lol/utils/function");
const index_1 = require("../index");
class FileAPI extends index_1.API {
    get globs() {
        return this.store('globs') ? this.store('globs') : this.store('globs', []);
    }
    init() {
        function_1.bind(['bundle_copy', 'bundle_apply'], this);
        this.copy('**/*');
    }
    bundle() {
        return this.bundle_copy().then(this.bundle_apply);
    }
    helpers() {
        return {
            file: this.file,
            copy: this.copy,
            remove: this.remove,
            rename: this.rename,
            move: this.move,
            ignore: this.ignore
        };
    }
    file(file, parameters) {
        // Defaults
        parameters = Object.assign({
            file: file,
            action: 'copy',
            context: 'source'
        }, parameters || {});
        this.globs.push(parameters);
    }
    copy(file, output) {
        if (output) {
            this.globs.push({ file: file, action: 'copy', context: 'destination', output: output });
            return;
        }
        this.globs.push({ file: file, action: 'copy', context: 'source' });
    }
    remove(file) {
        this.globs.push({ file: file, action: 'remove', context: 'destination' });
    }
    move(file, output) {
        this.globs.push({ file: file, action: 'move', context: 'destination', output: output });
    }
    rename(file, output) {
        this.move(file, output);
    }
    ignore(file) {
        this.remove(file);
    }
    bundle_copy() {
        const globs = this.globs.filter(glob => glob.context === 'source')
            .map(glob => this.fromSource(glob.file));
        const in_out = utils_1.fetch(globs).map((file) => {
            return [file, this.toDestination(file)];
        });
        return when_1.all(in_out.map(function (io) {
            return utils_1.copy(io[0], io[1]);
        }));
    }
    bundle_apply() {
        return this.globs
            .filter((glob) => glob.context === 'destination')
            .map((glob) => {
            const files = utils_1.fetch(this.fromDestination(glob.file))
                .map((file) => {
                return () => {
                    if (glob.output && glob.action === 'copy') {
                        return utils_1.copy(file, this.fromDestination(glob.output));
                    }
                    else if (glob.output && glob.action === 'move') {
                        return utils_1.move(file, this.fromDestination(glob.output));
                    }
                    else if (glob.action === 'remove') {
                        return utils_1.remove(file);
                    }
                };
            });
            return when_1.reduce(files, (r, fn) => fn(), null);
        });
    }
}
exports.FileAPI = FileAPI;
