import { Boilerplate } from '../../boilerplate/boilerplate'
import { API } from "../api";
import { Configure } from "../../stack/configure";

export class BoilerplateAPI extends API {

  init() {}

  bundle() {}

  helpers() {
    return {
      LocalAPI:   this.LocalAPI,
      LocalStack: this.LocalStack,
      LocalStore: this.LocalStore,
      RootAPI:    this.RootAPI,
      RootStack:  this.RootStack,
      RootStore:  this.RootStore,
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

  LocalStore(key:string, value?:any) {
    return this.boilerplate.store(key, value)
  }

  RootStore(key:string, value?:any) {
    return this.boilerplate.root.store(key, value)
  }

  output(str?:string) {
    if (typeof str === 'string') {
      this.boilerplate.root.setOutput( str )
    }

    return this.boilerplate.root.dst_path
  }

}