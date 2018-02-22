import { Boilerplate } from '../boilerplate/boilerplate';
import { scope } from 'lol/utils/function'
import { reduce } from 'when';
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

  abstract bundle() : any | When.Promise<any>

  abstract helpers() : { [key:string]: Function }

  get current_task() {
    return this.boilerplate.current_task
  }

  store(key:string, value?:any) {
    return this.boilerplate.store(key, value)
  }

  shared_store(key:string, value?:any) {
    return this.boilerplate.root.store(key, value)
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

}