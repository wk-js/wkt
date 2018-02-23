"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
}
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const realize_package_specifier_1 = __importDefault(require("realize-package-specifier"));
const git = __importStar(require("../utils/git"));
const when = __importStar(require("when"));
const string_1 = require("lol/utils/string");
const function_1 = require("lol/utils/function");
const fs_2 = require("asset-pipeline/js/utils/fs");
const path_1 = require("path");
function NOOP() { }
function checkPath(str) {
    try {
        fs_1.statSync(str);
    }
    catch (e) {
        // console.log(`"${str}" does not exist.`)
        return false;
    }
    return true;
}
class Resolver {
    constructor(resolver) {
        this.resolver = resolver;
        this.sources = {};
        function_1.bind(this, 'get', 'register', 'resolve', 'resolveId', 'resolvePath', 'resolveRepository');
    }
    resolve(pathOrIdOrRepo, relativeTo) {
        const iterator = new ResolveIterator([
            this.resolveId,
            this.resolvePath,
            this.resolveRepository
        ], pathOrIdOrRepo, relativeTo);
        return iterator.start()
            .then((item) => {
            this.register(pathOrIdOrRepo, item);
            return item;
        });
    }
    get(id) {
        return this.sources[id];
    }
    register(id, item) {
        this.sources[id] = item;
    }
    resolveId(iterator) {
        const path = this.get(iterator.pathOrIdOrRepo);
        path ? iterator.resolve(path) : iterator.next();
    }
    resolvePath(iterator) {
        const resolve_paths = [process.cwd()];
        if (fs_2.isFile(iterator.relativeToPath)) {
            resolve_paths.push(path_1.dirname(iterator.relativeToPath));
        }
        let result;
        for (let i = 0, ilen = resolve_paths.length; i < ilen; i++) {
            result = path_1.join(resolve_paths[i], iterator.pathOrIdOrRepo);
            if (checkPath(result)) {
                iterator.resolve(this.resolver(result));
                break;
            }
        }
        iterator.next();
    }
    resolveRepository(iterator) {
        realize_package_specifier_1.default(iterator.pathOrIdOrRepo, (err, res) => {
            if (err) {
                console.log(err);
                iterator.next();
                return;
            }
            let path = null;
            if (res.type.match(/^(local|directory)$/)) {
                this.resolvePath(iterator);
            }
            else if (res.type === 'hosted') {
                const hash = string_1.toSlug(iterator.pathOrIdOrRepo);
                const repo = res.hosted.ssh.split('#');
                const repo_url = repo[0];
                const repo_committish = repo[1];
                path = `${process.cwd()}/.wkt-tmp/${hash}`;
                let promise = when.resolve();
                if (!checkPath(path)) {
                    promise = promise.then(() => {
                        return git.clone(repo_url, path);
                    });
                }
                if (repo_committish) {
                    promise = promise.then(() => {
                        return git.checkout(repo_committish, path);
                    });
                }
                promise.then(() => iterator.resolve(this.resolver(path)));
            }
        });
    }
}
exports.Resolver = Resolver;
class ResolveIterator {
    constructor(functions, pathOrIdOrRepo, relativeToPath, resolve = NOOP, reject = NOOP) {
        this.functions = functions;
        this.pathOrIdOrRepo = pathOrIdOrRepo;
        this.relativeToPath = relativeToPath;
        this.resolve = resolve;
        this.reject = reject;
        this.pointer = -1;
        this.resolved = false;
    }
    next() {
        this.pointer++;
        if (this.pointer < this.functions.length && !this.resolved) {
            return {
                done: false,
                value: this.functions[this.pointer](this)
            };
        }
        if (!this.resolved) {
            this.reject(new Error(`Cannot resolve "${this.pathOrIdOrRepo}"`));
        }
        return {
            done: true,
            value: null
        };
    }
    start() {
        return when.promise((resolve, reject) => {
            this.resolve = (item) => {
                this.resolved = true;
                resolve(item);
            };
            this.reject = (e) => {
                this.resolved = true;
                reject(e);
            };
            this.next();
        });
    }
}
