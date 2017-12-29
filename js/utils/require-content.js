"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function requireContent(content, path, parent, xprts) {
    const Module = module.constructor;
    const mod = new Module(path, parent);
    mod.filename = path;
    mod.exports = xprts;
    mod.loaded = true;
    mod._compile(content, path);
}
exports.requireContent = requireContent;
