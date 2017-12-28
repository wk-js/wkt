import { MixinConstructor } from '../utils/mixin';
import { Boilerplate } from '../boilerplate';
import { scope } from 'lol/utils/function'
import { join } from "path";
import { reduce, all } from 'when';
import { Resolver } from '../resolver/index';

const APIResolver = new Resolver<new (...args:any[]) => API>((path:string) => {
  return require( path )
})

export interface APIStore {
  [key: string]: any
}

export abstract class API {

  static Resolver = APIResolver

  stores:APIStore = {}

  constructor(public boilerplate:Boilerplate) {
    this.init()
  }

  abstract init() : void

  abstract bundle() : void

  abstract helpers() : { [key:string]: Function }

  get current_bundle() {
    return this.boilerplate.current_bundle
  }

  store(key:string, value?:any) {
    this.stores[this.current_bundle] = this.stores[this.current_bundle] || {}

    if (arguments.length === 2) {
      this.stores[this.current_bundle][key] = value
      return this.stores[this.current_bundle][key]
    }

    return this.stores[this.current_bundle][key]
  }

  shared_store(key:string, value?:any) {
    this.stores['__shared'] = this.stores['__shared'] || {}

    if (arguments.length === 2) {
      this.stores['__shared'][key] = value
      return this.stores['__shared'][key]
    }

    return this.stores['__shared'][key]
  }

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

  static create( boilerplate:Boilerplate, api_list:string[] ) {
    const apis : { [key:string]: API } = {}
    const helpers : { [key:string]: Function } = {}
    let api_class, hlprs

    for (const key of api_list) {
      api_class = API.Resolver.get( key ) as new (...args:any[]) => API
      apis[key] = new api_class( boilerplate )

      hlprs = apis[key].helpers()
      for (const hkey in hlprs) {
        helpers[hkey] = scope( hlprs[hkey], apis[key] )
      }
    }

    return { apis, helpers }
  }

  static bundle( boilerplate:Boilerplate ) {
    const keys = Object.keys(boilerplate.api.apis).map(function(key) {
      return function() {
        return boilerplate.api.apis[key].bundle()
      }
    })

    return reduce(keys, function(res:null, bundle:Function) {
      return bundle()
    }, null)
  }

  static resolve(paths:string[]) {
    return all(paths.map(function(path) {
      return API.Resolver.resolve(path)
    }))
  }

}