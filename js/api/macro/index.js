"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
class MacroAPI extends index_1.API {
    get macros() {
        return this.store('macros') ? this.store('macros') : this.store('macros', {});
    }
    init() {
        this.setMacro = this.setMacro.bind(this);
        this.getMacro = this.getMacro.bind(this);
    }
    bundle() { }
    helpers() {
        return {
            macro: this.macro
        };
    }
    setMacro(key, macro) {
        this.macros[key] = macro;
    }
    getMacro(key, ...args) {
        return this.macros[key];
    }
    macro(key, ...args) {
        if (!key) {
            return {
                get: this.getMacro,
                set: this.setMacro
            };
        }
        const macro = this.getMacro(key);
        if (typeof macro === 'function') {
            return macro.apply(macro, args);
        }
    }
}
exports.MacroAPI = MacroAPI;
