import { Boilerplate } from '../../boilerplate'
import { API } from "../index";
import { Configure } from "../../stack/configure";

export class StackAPI extends API {

  init() {}

  bundle() {}

  helpers() {
    return {
      add:       this.add,
      before:    this.before,
      after:     this.after,
      invocator: this.invocator,
      output:    this.output
    }
  }

  stack() : Configure {
    return this.boilerplate.stack
  }

  add(key:string | Function, fn?:Function) {
    this.boilerplate.stack.add(key, fn)
  }

  before(bfore:string, key:string | Function, fn?:Function) {
    this.boilerplate.stack.before(bfore, key, fn)
  }

  after(after:string, key:string | Function, fn?:Function) {
    this.boilerplate.stack.after(after, key, fn)
  }

  invocator() {
    return this.boilerplate.root.stack
  }

  output(str?:string) {
    if (typeof str === 'string') {
      this.boilerplate.root.output = str
    }

    return this.boilerplate.root.output
  }

}