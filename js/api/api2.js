"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const object_1 = require("lol/utils/object");
function NOOP() { return {}; }
const APIDefaults = {
    computed: {},
    methods: {},
    data: NOOP,
    helpers: NOOP,
    init: NOOP,
    bundle: NOOP
};
class API {
    constructor(options) {
        if (options) {
            // Init data
            const data = options.data;
            if (typeof data === 'function') {
                object_1.merge(this, data.call(this));
            }
            else if (typeof data === 'object' && !Array.isArray(data)) {
                object_1.merge(this, data);
            }
            // Init methods
            const methods = options.methods;
            for (const keyMethod in methods) {
                this[keyMethod] = methods[keyMethod].bind(this);
            }
            // Init helpers
            const helpers = options.helpers;
            this['helpers'] = helpers.bind(this);
            // Init computed
            const computed = options.computed;
            for (const keyComputed in methods) {
                let get, set;
                if (typeof methods[keyComputed] === 'function') {
                    get = methods[keyComputed];
                }
                else if (typeof methods[keyComputed] === 'object') {
                    get = methods[keyComputed].get;
                    set = methods[keyComputed].set;
                }
                Object.defineProperty(this, keyComputed, {
                    get: get,
                    set: set
                });
            }
        }
    }
    store(key, value) {
        return this.boilerplate.store(key, value);
    }
    shared_store(key, value) {
        return this.boilerplate.root.store(key, value);
    }
    static create(options) {
        options = Object.assign({}, APIDefaults, options || {});
        const ctor = API;
        return new ctor(options);
    }
}
exports.API = API;
