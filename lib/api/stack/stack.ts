import { Boilerplate } from '../../boilerplate'
import { API } from "../index";
import { Configure } from "../../stack/configure";

export function getAPIClass() {
  return StackAPI
}

export class StackAPI extends API {

  init() {}

  bundle() {}

  helpers() {
    return {
      add:    this.add,
      before: this.before,
      after:  this.after,
      invocator: this.invocator
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

}