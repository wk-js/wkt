import { Boilerplate } from '../../boilerplate'
import { API } from "../index";
import { Configure } from "../../stack/configure";

export class StackAPI extends API {

  init() {}

  bundle() {}

  helpers() {
    return {
      stack:     this.stack,
      invocator: this.invocator,
      output:    this.output
    }
  }

  stack() : Configure {
    return this.boilerplate.stack
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