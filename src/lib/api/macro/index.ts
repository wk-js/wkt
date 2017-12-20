import { Boilerplate } from '../../boilerplate'
import { API } from "../index";

export function getAPIClass() {
  return MacroAPI
}

export class MacroAPI extends API {

  get macros() {
    return this.store('macros') ? this.store('macros') : this.store('macros', {})
  }

  init() {}

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