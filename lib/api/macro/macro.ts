import { Boilerplate } from '../../boilerplate/boilerplate'
import { API } from "../api";

export class MacroAPI extends API {

  get macros() {
    return this.store('macros') ? this.store('macros') : this.store('macros', {})
  }

  init() {
    this.setMacro = this.setMacro.bind(this)
    this.getMacro = this.getMacro.bind(this)
  }

  bundle() {}

  helpers() {
    return {
      macro: this.macro
    }
  }

  setMacro(key:string, macro:Function) {
    this.macros[key] = macro
  }

  getMacro(key:string, ...args:any[]) {
    return this.macros[key]
  }

  macro(key?:string, ...args:any[]) {
    if (!key) {
      return {
        get: this.getMacro,
        set: this.setMacro
      }
    }

    const macro = this.getMacro(key)
    if (typeof macro === 'function') {
      return macro.apply(macro, args)
    }
  }

}