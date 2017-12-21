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
    if(!fn) {
      fn = key as Function
      this.boilerplate.stack.insert(fn)
      return
    }

    this.boilerplate.stack.add(key as string, fn)
  }

  before(bfore:string, key:string | Function, fn?:Function) {
    if(!fn) {
      fn = key as Function
      this.boilerplate.stack.insertBefore(bfore, fn)
      return
    }

    this.boilerplate.stack.before(bfore, key as string, fn)
  }

  after(after:string, key:string | Function, fn?:Function) {
    if(!fn) {
      fn = key as Function
      this.boilerplate.stack.insertAfter(after, fn)
      return
    }

    this.boilerplate.stack.after(after, key as string, fn)
  }

  invocator() {
    return (this.boilerplate.invocator as Boilerplate).stack
  }

}