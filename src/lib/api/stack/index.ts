import { API } from "../index";
import { Configure, ConfigureAction } from "../../stack/configure";

export class StackAPI extends API {

  bundle() {}

  helpers() {
    return {
      stack:  this.stack,
      before: this.before,
      after:  this.after
    }
  }

  stack() : Configure {
    return this.boilerplate.stack
  }

  before(key:string, fn:ConfigureAction) {
    this.boilerplate.stack.insertBefore(key, fn)
  }

  after(key:string, fn:ConfigureAction) {
    this.boilerplate.stack.insertAfter(key, fn)
  }

}