"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const utils_1 = require("../file/utils");
const when_1 = require("when");
const renderer_1 = require("./renderer");
const chunk_stack_1 = require("./chunk_stack");
const object_1 = require("lol/utils/object");
const js_beautify_1 = require("js-beautify");
const _DATA = {};
class TemplateSingleton extends __1.API {
    constructor(boilerplate) {
        super(boilerplate.root);
        this.chunk_stack = new chunk_stack_1.ChunkStack;
        this.data = {};
        TemplateSingleton.templates[boilerplate.root.input] = this;
    }
    get globs() {
        return this.store('globs') ? this.store('globs') : this.store('globs', {});
    }
    store(key, value) {
        this.stores[this.boilerplate.root.input] = this.stores[this.boilerplate.root.input] || {};
        if (arguments.length === 2) {
            this.stores[this.boilerplate.root.input][key] = value;
            return this.stores[this.boilerplate.root.input][key];
        }
        return this.stores[this.boilerplate.root.input][key];
    }
    init() {
        this.afterRootBundle = this.afterRootBundle.bind(this);
        this.boilerplate.root.stack.after('bundle', this.afterRootBundle);
    }
    bundle() { }
    helpers() {
        return {
            template: this.template,
            templateData: this.templateData,
            chunkAdd: this.chunkAdd,
            chunkBefore: this.chunkBefore,
            chunkAfter: this.chunkAfter
        };
    }
    afterRootBundle() {
        return when_1.reduce(Object.keys(this.globs), (res, glob_key) => {
            const options = this.globs[glob_key];
            const promises = utils_1.fetch(this.fromDestination(glob_key)).map((file) => {
                return utils_1.readFile(file)
                    .then((content) => {
                    options.imports = {
                        chunk: (key) => this.chunk_stack.get(key) || ''
                    };
                    options.data = object_1.merge({}, this.data, options.data);
                    options.interpolate = options.interpolate || /{{([\s\S]+?)}}/g;
                    options.evaluate = options.evaluate || /{%([\s\S]+?)%}/g;
                    options.escape = options.escape || /{{{([\s\S]+?)}}}/g;
                    return renderer_1.Renderer.render(content.toString('utf-8'), options, options.data);
                })
                    .then((content) => {
                    if (file.match(/\.js$/)) {
                        return js_beautify_1.js_beautify(content, {
                            indent_size: 2,
                            max_preserve_newlines: 2
                        });
                    }
                    return content;
                })
                    .then((content) => {
                    return utils_1.writeFile(content, file);
                });
            });
            return when_1.all(promises);
        }, null);
    }
    template(file, options) {
        options = Object.assign({
            data: {},
            imports: {}
        }, options || {});
        const glob = this.globs[file] || { data: {}, imports: {} };
        object_1.merge(glob, options);
        this.globs[file] = glob;
    }
    templateData(data) {
        Object.assign(this.data, data);
    }
    chunkAdd(key, chunk) {
        this.chunk_stack.add(key, chunk);
    }
    chunkBefore(bfore, key, chunk) {
        this.chunk_stack.before(bfore, key, chunk);
    }
    chunkAfter(after, key, chunk) {
        this.chunk_stack.after(after, key, chunk);
    }
}
TemplateSingleton.templates = {};
exports.TemplateSingleton = TemplateSingleton;
class TemplateAPI extends __1.API {
    get singleton() {
        if (!TemplateSingleton.templates[this.boilerplate.root.input]) {
            return new TemplateSingleton(this.boilerplate);
        }
        return TemplateSingleton.templates[this.boilerplate.root.input];
    }
    init() {
        const singleton = this.singleton;
    }
    bundle() { }
    helpers() {
        const helpers = {};
        const shelpers = this.singleton.helpers();
        const scope = this.singleton;
        for (const key in shelpers) {
            helpers[key] = function () {
                return shelpers[key].apply(scope, arguments);
            };
        }
        return helpers;
    }
}
exports.TemplateAPI = TemplateAPI;
