"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const utils_1 = require("../file/utils");
const when_1 = require("when");
const renderer_1 = require("./renderer");
const chunk_stack_1 = require("./chunk_stack");
class TemplateAPI extends __1.API {
    constructor() {
        super(...arguments);
        this.chunk_stack = new chunk_stack_1.ChunkStack;
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
                        chunk: (key) => this.chunk_stack.get(key) || ''
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
            chunkAdd: this.chunkAdd,
            chunkBefore: this.chunkBefore,
            chunkAfter: this.chunkAfter
        };
    }
    template(file, options) {
        options = Object.assign({
            data: {}
        }, options || {});
        this.globs.push({ file, options });
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
exports.TemplateAPI = TemplateAPI;
