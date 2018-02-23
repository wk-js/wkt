"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const object_1 = require("lol/utils/object");
const resolver_1 = require("../resolver");
const function_1 = require("lol/utils/function");
const APIResolver = new resolver_1.Resolver((path) => {
    return require(path);
});
function NOOP() { }
function NOOPRet() { return {}; }
class API {
    constructor(options) {
        this.name = 'no_api_name';
        this._lifecycle = {
            init: NOOP,
            bundle: NOOP,
            helpers: NOOPRet
        };
        options = options || {};
        // Init data
        if (options.data) {
            const data = options.data;
            if (typeof data === 'function') {
                object_1.merge(this, data.call(this));
            }
            else if (typeof data === 'object' && !Array.isArray(data)) {
                object_1.merge(this, data);
            }
        }
        // Init methods
        if (options.methods) {
            const methods = options.methods;
            for (const keyMethod in methods) {
                this[keyMethod] = methods[keyMethod].bind(this);
            }
        }
        // Init computed
        if (options.computed) {
            const computed = options.computed;
            for (const keyComputed in computed) {
                let get, set;
                if (typeof computed[keyComputed] === 'function') {
                    get = computed[keyComputed];
                }
                else if (typeof computed[keyComputed] === 'object') {
                    get = computed[keyComputed].get;
                    set = computed[keyComputed].set;
                }
                Object.defineProperty(this, keyComputed, {
                    get: get,
                    set: set
                });
            }
        }
        // Lifecycle
        const lifecycle = object_1.expose(options, ['init', 'helpers', 'bundle']);
        for (const lcKey in lifecycle) {
            this._lifecycle[lcKey] = (lifecycle[lcKey] || this._lifecycle[lcKey]).bind(this);
        }
    }
    store(key, value) {
        return this.boilerplate.store(key, value);
    }
    shared_store(key, value) {
        return this.boilerplate.root.store(key, value);
    }
    configure(bp) {
        this.boilerplate = bp;
        this.boilerplate.stack.group('bundle:api').add(this.name, this._lifecycle.bundle);
        // Init
        this._lifecycle.init();
    }
    static create(options) {
        return new API(options);
    }
    static extend(name, options) {
        return class extends API {
            constructor(opts) {
                super(object_1.merge({}, options, opts));
                this.name = name;
            }
        };
    }
    static configure(boilerplate, api_list) {
        const apis = {};
        const helpers = {};
        let api_class, hlprs;
        for (const key of api_list) {
            api_class = API.Resolver.get(key);
            apis[key] = new api_class();
            hlprs = apis[key]._lifecycle.helpers();
            for (const hkey in hlprs) {
                helpers[hkey] = function_1.scope(hlprs[hkey], apis[key]);
            }
            apis[key].configure(boilerplate);
        }
        return { apis, helpers };
    }
}
API.Resolver = APIResolver;
exports.API = API;
