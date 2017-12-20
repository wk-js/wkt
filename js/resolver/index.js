"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const npa2 = require("realize-package-specifier");
const git = require("../utils/git");
const when = require("when");
const string_1 = require("lol/utils/string");
const function_1 = require("lol/utils/function");
function checkPath(str) {
    try {
        fs_1.statSync(str);
    }
    catch (e) {
        console.log(`"${str}" does not exist.`);
        return false;
    }
    return true;
}
class Resolver {
    constructor(resolver) {
        this.resolver = resolver;
        this.sources = {};
        function_1.bind(['get', 'register', 'resolve', 'resolveId', 'resolvePath', 'resolveRepository'], this);
    }
    resolve(pathOrIdOrRepo) {
        return when.promise((resolve, reject) => {
            const iterator = new ResolveIterator([
                this.resolveId,
                this.resolvePath,
                this.resolveRepository
            ], pathOrIdOrRepo, resolve, reject);
            iterator.next();
        })
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
        path ? iterator.complete(path) : iterator.next();
    }
    resolvePath(iterator) {
        checkPath(iterator.pathOrIdOrRepo) ?
            iterator.complete(this.resolver(iterator.pathOrIdOrRepo)) :
            iterator.next();
    }
    resolveRepository(iterator) {
        npa2(iterator.pathOrIdOrRepo, (err, res) => {
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
                path = `${process.cwd()}/.tmp/${hash}`;
                let promise = when();
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
                promise.then(() => iterator.complete(this.resolver(path)));
            }
        });
    }
}
exports.Resolver = Resolver;
class ResolveIterator {
    constructor(functions, pathOrIdOrRepo, complete, fail) {
        this.functions = functions;
        this.pathOrIdOrRepo = pathOrIdOrRepo;
        this.complete = complete;
        this.fail = fail;
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
        this.fail();
        return {
            done: true,
            value: null
        };
    }
}
