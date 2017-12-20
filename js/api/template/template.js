"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const utils_1 = require("../file/utils");
const when_1 = require("when");
const renderer_1 = require("./renderer");
class TemplateAPI extends __1.API {
    constructor() {
        super(...arguments);
        // get chunks() : any {
        //   return this.store('chunks') ? this.store('chunks') : this.store('chunks', {})
        // }
        this.chunks = {};
    }
    get globs() {
        return this.store('globs') ? this.store('globs') : this.store('globs', []);
    }
    init() { }
    bundle() {
        return when_1.reduce(this.globs, (res, glob) => {
            const promises = utils_1.fetch(this.fromDestination(glob.file)).map((file) => {
                return utils_1.readFile(file)
                    .then((content) => {
                    glob.options.imports = {
                        chunk: (key) => this.chunks[key] || ''
                    };
                    return renderer_1.Renderer.render(content.toString('utf-8'), glob.options, glob.options.data);
                })
                    .then((content) => {
                    return utils_1.writeFile(content, file);
                });
            });
            return when_1.all(promises);
        }, null);
    }
    helpers() {
        return {
            template: this.template,
            chunk: this.chunk
        };
    }
    template(file, options) {
        options = Object.assign({
            data: {}
        }, options || {});
        this.globs.push({ file, options });
    }
    chunk(key, value) {
        this.chunks[key] = value;
    }
}
exports.TemplateAPI = TemplateAPI;
