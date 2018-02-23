"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
}
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../api/api");
const configure_group_1 = require("../stack/configure-group");
const fs = __importStar(require("fs"));
const fs_extra_1 = require("fs-extra");
const when_1 = __importDefault(require("when"));
const path_1 = require("path");
const function_1 = require("lol/utils/function");
const array_1 = require("lol/utils/array");
const index_1 = require("../resolver/index");
const fs_1 = require("asset-pipeline/js/utils/fs");
const print_1 = require("../print");
const utils_1 = require("./utils");
const front_matter_1 = __importDefault(require("front-matter"));
const BoilerplateResolver = new index_1.Resolver((path) => path);
class Boilerplate {
    constructor(_output) {
        this._output = _output;
        this.configs = {};
        this.stores = {};
        this.stack = new configure_group_1.ConfigureGroup();
        this.path = '';
        this.name = 'no-name';
        this.parent = null;
        this.children = [];
        function_1.bind(this, 'parse', 'execute', 'bundle');
        this.stack.add('bundle', this.bundle);
    }
    get src_path() {
        return path_1.normalize(path_1.relative(process.cwd(), path_1.dirname(this.path)));
    }
    get dst_path() {
        return path_1.normalize(this.is_root ? this._output : this.root._output);
    }
    get absolute_src_path() {
        return path_1.normalize(path_1.dirname(this.path));
    }
    get absolute_dst_path() {
        const output = path_1.normalize(this.is_root ? this._output : this.root._output);
        if (path_1.isAbsolute(output))
            return output;
        return path_1.join(process.cwd(), output);
    }
    get current_task() {
        return this.stack.currentTask ? this.stack.currentTask : 'bundle';
    }
    get root() {
        return this.parent ? this.parent.root : this;
    }
    get is_root() {
        return this.root === this;
    }
    setOutput(output) {
        return this.root._output = output;
    }
    store(key, value) {
        if (typeof value !== 'undefined') {
            this.stores[key] = value;
            return this.stores[key];
        }
        return this.stores[key];
    }
    bundle() {
        print_1.P.debug('Bundles APIs', print_1.P.green(Object.keys(this.api.apis).join('|')));
        return api_1.API.bundle(this);
    }
    resolve(input, relativeTo = process.cwd()) {
        return Boilerplate.Resolver.resolve(input, relativeTo).then(this.parse);
    }
    parse(pth) {
        if (!fs_1.isFile(pth)) {
            pth = path_1.join(pth, 'template.js');
            if (!fs_1.isFile(pth))
                return when_1.default.resolve(null);
        }
        this.path = pth;
        const scope = this;
        const content = fs.readFileSync(this.path, 'utf-8');
        const result = front_matter_1.default(content);
        const attrs = Object.assign({
            name: path_1.extname(pth).length > 0 ? path_1.basename(path_1.dirname(pth)) : path_1.basename(pth),
            sources: [],
            optionalSources: [],
            apis: [],
            optionalApis: []
        }, result.attributes);
        this.name = attrs.name;
        return utils_1.fetch_optionals(attrs.sources, attrs.optionalSources)
            .then(() => utils_1.fetch_optionals(attrs.apis, attrs.optionalApis))
            .then(() => {
            return when_1.default.reduce([
                function () { return scope.resolveSources(attrs.sources); },
                function () { return scope.resolveAPIs(attrs.apis, result.body); }
            ], (res, action) => action(), null);
        });
    }
    resolveAPIs(apis, content) {
        return when_1.default.all(apis.map((path) => {
            return api_1.API.Resolver.resolve(path, this.path);
        }))
            .then(() => {
            apis = apis.concat(this.getUsedAPIs());
            this.api = api_1.API.create(this, array_1.unique(apis));
            utils_1.parse(this, content);
        });
    }
    resolveSources(sources) {
        return when_1.default.all(sources.map((path) => {
            const bp = new Boilerplate(this._output);
            bp.parent = this;
            this.children.push(bp);
            return bp.resolve(path, this.path);
        }));
    }
    getUsedAPIs() {
        let apis = [];
        for (let i = 0, ilen = this.children.length; i < ilen; i++) {
            apis = apis.concat(apis, this.children[i].getUsedAPIs());
        }
        if (this.api) {
            apis = apis.concat(Object.keys(this.api.apis));
        }
        return array_1.unique(apis);
    }
    execute() {
        if (this.children.length > 0) {
            this.stack.before('bundle', 'bundle:children', () => {
                return when_1.default.reduce(this.children, (res, bp) => bp.execute(), null);
            });
        }
        return this.stack.execute({
            beforeTask: () => {
                let print = `Execute ${print_1.P.green(this.stack.currentTask)} from ${print_1.P.magenta(this.name)}`;
                if (this.is_root)
                    print += print_1.P.yellow(' (root)');
                print_1.P.debug(print);
            }
        })
            .then(() => {
            if (this.is_root) {
                print_1.P.debug(`Bundle done!`);
                this.clean();
            }
            return true;
        });
    }
    clean() {
        // Clean tmp directory
        fs_extra_1.removeSync(`${process.cwd()}/.wkt-tmp`);
    }
}
Boilerplate.Resolver = BoilerplateResolver;
exports.Boilerplate = Boilerplate;
