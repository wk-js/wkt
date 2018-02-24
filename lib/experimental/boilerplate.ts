import { API, APIConstructor } from './api'
import { Boilerplate } from '../boilerplate/boilerplate';
import { ConfigureGroup } from '../stack/configure-group';

export const BoilerplateAPI = API.extend('boilerplate', {

  helpers() : { [key:string]: Function } {
    return {
      api:    this.api,
      stack:  this.stack,
      store:  this.store,
      output: this.output
    }
  },

  methods: {

    getBoilerplate(type='local') {
      const bp = (<Boilerplate>this.boilerplate)
      return type === 'local' ? bp : bp.root
    },

    api(type='local') {
      return this.getBoilerplate(type).api.helpers
    },

    stack(type='local') {
      return this.getBoilerplate(type).stack
    },

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
    },

    output(str?:string) {
      const bp = (<Boilerplate>this.boilerplate)

      if (typeof str === 'string') {
        bp.root.setOutput( str )
      }

      return bp.root.dst_path
    }

  }

})