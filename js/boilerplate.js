"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./api/index");
const configure_1 = require("./stack/configure");
const fs = require("fs");
const when = require("when");
const path_1 = require("path");
const function_1 = require("lol/utils/function");
const index_2 = require("./resolver/index");
function parse(boilerplate, content, throwOnError = true) {
    let scope = "var helpers = this;\n";
    const api = boilerplate.api.helpers;
    for (const key in api) {
        scope += `function ${key}() { return helpers.${key}.apply(null, arguments); }\n`;
    }
    scope += "\n" + content;
    try {
        Function(scope).call(api);
    }
    catch (e) {
        if (throwOnError)
            throw e;
    }
}
function imports(key, content, path) {
    const line_regex = new RegExp(`//${key}((.+))`, 'gm');
    const str_regex = /\(.+\)/g;
    const lines = content.match(line_regex) || [];
    const imports = lines.map(line => {
        let result = line.match(str_regex)[0];
        result = result.trim().replace(/"|'|`|\(|\)/g, '').trim();
        let pth = path_1.join(path_1.dirname(path), result);
        pth = path_1.join(process.cwd(), pth);
        try {
            fs.statSync(pth);
            return pth;
        }
        catch (e) {
            // console.log( e )
        }
        return result;
    });
    return Array.prototype.concat.apply([], imports);
}
function resolver(path) {
    return path;
}
const BoilerplateResolver = new index_2.Resolver((path) => path);
class Boilerplate {
    constructor(input, output) {
        this.input = input;
        this.output = output;
        this.configs = {};
        this.stack = new configure_1.Configure();
        this.path = '';
        this.children = [];
        this.invocator = null;
        function_1.bind(['parse', 'execute'], this);
        this.stack.add('bundle');
    }
    get src_path() {
        return path_1.dirname(this.path);
    }
    get dst_path() {
        return this.output;
    }
    get current_bundle() {
        return this.stack.currentTask ? this.stack.currentTask : 'bundle';
    }
    config(key, value) {
        if (arguments.length == 2) {
            this.configs[key] = value;
            return this.configs[key];
        }
        return this.configs[key];
    }
    resolve() {
        return Boilerplate.Resolver.resolve(this.input).then(this.parse);
    }
    parse(pth) {
        this.path = pth;
        const scope = this;
        const content = fs.readFileSync(this.path, 'utf-8');
        return when.reduce([
            function () { return scope.resolveSources(content); },
            function () { return scope.resolveAPIs(content); }
        ], (res, action) => action(), null);
    }
    resolveAPIs(content) {
        const api_imports = imports('api', content, this.path);
        return when.all(api_imports.map(function (path) {
            return index_1.API.Resolver.resolve(path);
        }))
            .then(() => {
            this.api = index_1.API.create(this, api_imports);
            parse(this, content);
        });
    }
    resolveSources(content) {
        const src_imports = imports('source', content, this.path);
        return when.all(src_imports.map(function (path) {
            return Boilerplate.Resolver.resolve(path);
        }))
            .then((paths) => {
            const boilerplates = paths.map((path) => {
                const bp = new Boilerplate(path, this.output);
                const invocator = this.invocator || this;
                bp.invocator = invocator;
                return bp;
            });
            this.children = this.children.concat(boilerplates);
            return when.all(boilerplates.map((bp) => bp.resolve()));
        });
    }
    execute() {
        return when.reduce(this.children, (res, bp) => bp.execute(), null)
            .then(() => {
            return this.stack.execute({
                afterTask: () => index_1.API.bundle(this)
            });
        })
            .then(() => {
            console.log(`Bundle "${this.input}" done!`);
        });
    }
}
Boilerplate.Resolver = BoilerplateResolver;
exports.Boilerplate = Boilerplate;