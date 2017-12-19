import { API } from "../index";

export class MacroAPI extends API {

  macros: { [key:string]: Function } = {}

  bundle() {}

  helpers() {
    return {
      macro: this.macro
    }
  }

  createMacro(key:string, macro:Function) {
    this.macros[key] = macro
  }

  macro(key:string, ...args:any[]) {
    if (!this.macros.hasOwnProperty(key)) {
      return {
        create: (macro:Function) => {
          this.createMacro(key, macro)
        }
      }
    }

    if (typeof this.macros[key] === 'function') {
      return this.macros[key].apply(this.macros[key], args)
    }
  }

}