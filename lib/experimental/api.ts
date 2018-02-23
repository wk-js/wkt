import { Boilerplate } from "../boilerplate/boilerplate";
import { merge, expose } from "lol/utils/object";
import { Resolver } from "../resolver";
import { scope } from "lol/utils/function";

const APIResolver = new Resolver<new (...args:any[]) => API>((path:string) => {
  return require( path )
})

function NOOP() {}
function NOOPRet() { return {} }

export type DefaultData<A> = object | ((this: A) => object)
export type DefaultMethods<A> = { [key:string]: (this: A, ...args: any[]) => any }
export type DefaultComputed = { [key:string]: any }

export type Accessors<T> = {
  [K in keyof T]: (() => T[K]) | { get?(): T, set?(value: T): void }
}

export interface APIOptions<A, Data=DefaultData<A>, Methods=DefaultMethods<A>, Computed=DefaultComputed> {
  data?: Data
  methods?: Methods
  computed?: Accessors<Computed>

  init?(): void
  bundle?(): any
  helpers?(): { [key:string]: Function }
}

export type ThisTypedAPIOptions<A extends API, Data, Methods, Computed> =
  object
  & APIOptions<A, Data, Methods, Computed>
  & ThisType<CombinedAPIInstance<A, Data, Methods, Computed>>

export type CombinedAPIInstance<Instance extends API, Data, Methods, Computed> = Data & Methods & Computed & Instance
export type ExtendedAPI<Instance extends API, Data, Methods, Computed> = APIConstructor<CombinedAPIInstance<Instance, Data, Methods, Computed> & API>

export interface APIConstructor<A extends API> {
  new<Data = object, Methods = object, Computed = object>(options?: ThisTypedAPIOptions<API, Data, Methods, Computed>) : CombinedAPIInstance<API, Data, Methods, Computed>

  extend<Data = object, Methods = object, Computed = object>(name:string, options?: ThisTypedAPIOptions<API, Data, Methods, Computed>) : ExtendedAPI<API, Data, Methods, Computed>
}

export class API {

  static Resolver = APIResolver

  boilerplate?: Boilerplate
  name: string = 'no_api_name'

  protected _lifecycle: { [key:string]: Function } = {
    init: NOOP,
    bundle: NOOP,
    helpers: NOOPRet
  }

  constructor(options?: ThisTypedAPIOptions<API, object, object, object>) {
    options = options || {}

    // Init data
    if (options.data) {
      const data = options.data as DefaultData<API>
      if (typeof data === 'function') {
        merge( this, (<Function>data).call(this) )
      } else if (typeof data === 'object' && !Array.isArray(data)) {
        merge( this, data )
      }
    }

    // Init methods
    if (options.methods) {
      const methods = options.methods as DefaultMethods<API>
      for (const keyMethod in methods) {
        (<any>this)[keyMethod] = (<any>methods)[keyMethod].bind(this)
      }
    }

    // Init computed
    if (options.computed) {
      const computed = options.computed as Accessors<DefaultComputed>
      for (const keyComputed in computed) {
        let get, set
        if (typeof computed[keyComputed] === 'function') {
          get = computed[keyComputed]
        } else if (typeof computed[keyComputed] === 'object') {
          get = (<any>computed[keyComputed]).get
          set = (<any>computed[keyComputed]).set
        }

        Object.defineProperty(this, keyComputed, {
          get: get,
          set: set
        })
      }
    }

    // Lifecycle
    const lifecycle = expose(options, [ 'init', 'helpers', 'bundle' ])
    for (const lcKey in lifecycle) {
      this._lifecycle[lcKey] = (lifecycle[lcKey] || this._lifecycle[lcKey]).bind(this)
    }
  }

  store(key:string, value?:any) {
    return (<Boilerplate>this.boilerplate).store(key, value)
  }

  shared_store(key:string, value?:any) {
    return (<Boilerplate>this.boilerplate).root.store(key, value)
  }

  configure(bp:Boilerplate) {
    this.boilerplate = bp
    this.boilerplate.stack.group('bundle:api').add(this.name, this._lifecycle.bundle)

    // Init
    this._lifecycle.init()
  }

  static create<Data = object, Methods = object, Computed = object>(options?: ThisTypedAPIOptions<API, Data, Methods, Computed>) : CombinedAPIInstance<API, Data, Methods, Computed> {
    return new API(options) as CombinedAPIInstance<API, Data, Methods, Computed>
  }

  static extend<Data = object, Methods = object, Computed = object>(name:string, options?: ThisTypedAPIOptions<API, Data, Methods, Computed>) : ExtendedAPI<API, Data, Methods, Computed> {
    return class extends API {
      constructor(opts?: ThisTypedAPIOptions<API, Data, Methods, Computed>) {
        super(merge( {}, options, opts ))
        this.name = name
      }
    } as ExtendedAPI<API, Data, Methods, Computed>
  }

  static configure( boilerplate:Boilerplate, api_list:string[]) {
    const apis : { [key:string]: API } = {}
    const helpers : { [key:string]: Function } = {}
    let api_class, hlprs

    for (const key of api_list) {
      api_class = API.Resolver.get( key ) as new (...args:any[]) => API
      apis[key] = new api_class()

      hlprs = apis[key]._lifecycle.helpers()
      for (const hkey in hlprs) {
        helpers[hkey] = scope( hlprs[hkey], apis[key] )
      }

      apis[key].configure( boilerplate )
    }

    return { apis, helpers }
  }

}

