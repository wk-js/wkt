import { Boilerplate } from '../../boilerplate'
import { API } from "../api";
import { Configure } from "../../stack/configure";

export class BoilerplateAPI extends API {

  init() {}

  bundle() {}

  helpers() {
    return {
      LocalAPI:   this.LocalAPI,
      RootAPI:    this.RootAPI,
      LocalStack: this.LocalStack,
      RootStack:  this.RootStack,
      output:     this.output
    }
  }

  LocalAPI() : Configure {
    return this.boilerplate.api.helpers
  }

  RootAPI() {
    return this.boilerplate.root.api.helpers
  }

  LocalStack() : Configure {
    return this.boilerplate.stack
  }

  RootStack() {
    return this.boilerplate.root.stack
  }

  output(str?:string) {
    if (typeof str === 'string') {
      this.boilerplate.root.output = str
    }

    return this.boilerplate.root.output
  }

}