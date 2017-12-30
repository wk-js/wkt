"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Module = module.constructor;
function requireContent(code, filename, context) {
    const mod = new Module(filename, module);
    mod.filename = filename;
    mod.exports = context;
    mod.loaded = true;
    mod._compile(code, filename);
}
exports.requireContent = requireContent;
