"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const function_1 = require("lol/utils/function");
const when_1 = require("when");
const index_1 = require("../resolver/index");
const APIResolver = new index_1.Resolver((path) => {
    return require(path);
});
class API {
    constructor(boilerplate) {
        this.boilerplate = boilerplate;
        this.stores = {};
        this.init();
    }
    get current_task() {
        return this.boilerplate.current_task;
    }
    store(key, value) {
        return this.boilerplate.store(key, value);
    }
    shared_store(key, value) {
        return this.boilerplate.root.store(key, value);
    }
    static create(boilerplate, api_list) {
        const apis = {};
        const helpers = {};
        let api_class, hlprs;
        for (const key of api_list) {
            api_class = API.Resolver.get(key);
            apis[key] = new api_class(boilerplate);
            hlprs = apis[key].helpers();
            for (const hkey in hlprs) {
                helpers[hkey] = function_1.scope(hlprs[hkey], apis[key]);
            }
        }
        return { apis, helpers };
    }
    static bundle(boilerplate) {
        const keys = Object.keys(boilerplate.api.apis).map(function (key) {
            return function () {
                return boilerplate.api.apis[key].bundle();
            };
        });
        return when_1.reduce(keys, function (res, bundle) {
            return bundle();
        }, null);
    }
}
API.Resolver = APIResolver;
exports.API = API;
