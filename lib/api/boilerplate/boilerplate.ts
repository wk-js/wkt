import { Boilerplate } from '../../boilerplate/boilerplate'
import { API } from "../api";
import { ConfigureGroup } from "../../stack/configure-group";

export class BoilerplateAPI extends API {

  init() {}

  bundle() {}

  helpers() {
    return {
      api:    this.api,
      stack:  this.stack,
      store:  this.store,
      output: this.output
    }
  }

  getBoilerplate(type='local') {
    return type === 'local' ? this.boilerplate : this.boilerplate.root
  }

  api(type='local') {
    return this.getBoilerplate(type).api.helpers
  }

  stack(type='local') {
    return this.getBoilerplate(type).stack
  }

  store(type:string) {
    const bp = this.getBoilerplate(type)
    return {
      get: function(key:string) {
        return bp.store(key)
      },

      set: function(key: string, value:any) {
        return bp.store(key, value)
      }
    }
  }

  output(str?:string) {
    if (typeof str === 'string') {
      this.boilerplate.root.setOutput( str )
    }

    return this.boilerplate.root.dst_path
  }

}