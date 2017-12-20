"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
function getAPIClass() {
    return MacroAPI;
}
exports.getAPIClass = getAPIClass;
class MacroAPI extends index_1.API {
    get macros() {
        return this.store('macros') ? this.store('macros') : this.store('macros', {});
    }
    init() { }
    bundle() { }
    helpers() {
        return {
            macro: this.macro
        };
    }
    createMacro(key, macro) {
        this.macros[key] = macro;
    }
    macro(key, ...args) {
        if (!this.macros.hasOwnProperty(key)) {
            return {
                create: (macro) => {
                    this.createMacro(key, macro);
                }
            };
        }
        if (typeof this.macros[key] === 'function') {
            return this.macros[key].apply(this.macros[key], args);
        }
    }
}
exports.MacroAPI = MacroAPI;
