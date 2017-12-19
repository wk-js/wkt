import { MixinConstructor } from '../utils/mixin';
import { Boilerplate } from '../boilerplate';
import { scope } from 'lol/utils/function'
import { join } from "path";

export abstract class API {

  constructor(public boilerplate:Boilerplate) {}

  abstract bundle() : void

  abstract helpers() : { [key:string]: Function }

  fromSource(str:string) {
    return join( this.boilerplate.src_path, str )
  }

  fromDestination(str:string) {
    return join( this.boilerplate.dst_path, str )
  }

  toSource(dst:string) {
    return dst.replace( new RegExp(`^${this.boilerplate.dst_path}`), this.boilerplate.src_path )
  }

  toDestination(src:string) {
    return src.replace( new RegExp(`^${this.boilerplate.src_path}`), this.boilerplate.dst_path )
  }

  static apis: { [key: string]: new (...args:any[]) => API } = {}

  static register(key:string, api:new (...args:any[]) => API) {
    API.apis[ key ] = api
  }

  static create( boilerplate:Boilerplate ) {
    const apis : { [key:string]: API } = {}
    const helpers : { [key:string]: Function } = {}
    let api_class, hlprs

    for (const key in API.apis) {
      api_class = API.apis[key]
      apis[key] = new api_class( boilerplate )

      hlprs = apis[key].helpers()
      for (const hkey in hlprs) {
        helpers[hkey] = scope( hlprs[hkey], apis[key] )
      }
    }

    return { apis, helpers }
  }

  static bundle( boilerplate:Boilerplate ) {
    for (const key in boilerplate.api.apis) {
      boilerplate.api.apis[key].bundle()
    }
  }

}