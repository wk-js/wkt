import { merge } from "lol/utils/object";
import { Boilerplate } from '..';

export type CombinedAPIInstance<Instance extends API, Data, Methods, Computed> = Data & Methods & Computed & Instance

export type ThisTypedAPIOptions<A extends API, Data, Methods, Computed> =
  object
  & APIOptions<A, Data | ((this: Readonly<Record<string, any> & A>) => Data), Methods, Computed>
  & ThisType<CombinedAPIInstance<A, Data, Methods, Computed>>

/**
 * When the `Computed` type parameter on `ComponentOptions` is inferred,
 * it should have a property with the return type of every get-accessor.
 * Since there isn't a way to query for the return type of a function, we allow TypeScript
 * to infer from the shape of `Accessors<Computed>` and work backwards.
 */
export type Accessors<T> = {
  [K in keyof T]: (() => T[K]) | APIComputedOptions<T[K]>
}

export interface APIComputedOptions<T> {
  get?(): T;
  set?(value: T): void;
}

export interface APIHelpers<A> {
  [key:string]: (this: A, ...args: any[]) => any
}

export type APIDefaultData<A> = object | ((this: A) => object)
export type APIDefaultMethods<A> = { [key: string]: (this: A, ...args: any[]) => any }
export type APIDefaultComputed = { [key:string]: any }
export interface APIOptions<
  A extends API,
  Data=APIDefaultData<A>,
  Methods=APIDefaultMethods<A>,
  Computed=APIDefaultComputed
> {
  data?:Data
  methods?:Methods
  computed?:Accessors<Computed>

  init?(): void
  bundle?(): void
  helpers?(): APIHelpers<A>
}

export interface APIConstructor<A extends API = API> {
  new <Data = object, Methods = object, Computed = object>(options?: ThisTypedAPIOptions<A, Data, Methods, Computed>) : CombinedAPIInstance<A, Data, Methods, Computed>

  create<Data, Methods, Computed>(options?: ThisTypedAPIOptions<A, Data, Methods, Computed>) : CombinedAPIInstance<A, Data, Methods, Computed>
}

function NOOP() { return {} }
const APIDefaults = {
  computed: {},
  methods: {},
  data: NOOP,
  helpers: NOOP,
  init: NOOP,
  bundle: NOOP
}

export class API<Data = object, Methods = object, Computed = object> {

  boilerplate?: Boilerplate

  constructor(options?:ThisTypedAPIOptions<API, Data, Methods, Computed>) {

    if (options) {
      // Init data
      const data = options.data as Data
      if (typeof data === 'function') {
        merge( this, (<Function>data).call(this) )
      } else if (typeof data === 'object' && !Array.isArray(data)) {
        merge( this, data )
      }

      // Init methods
      const methods = options.methods as Methods
      for (const keyMethod in methods) {
        (<any>this)[keyMethod] = (<any>methods)[keyMethod].bind(this)
      }

      // Init helpers
      const helpers = options.helpers as () => APIHelpers<API>
      (<any>this)['helpers'] = helpers.bind(this)

      // Init computed
      const computed = options.computed as Accessors<Computed>
      for (const keyComputed in methods) {
        let get, set
        if (typeof methods[keyComputed] === 'function') {
          get = methods[keyComputed]
        } else if (typeof methods[keyComputed] === 'object') {
          get = (<any>methods[keyComputed]).get
          set = (<any>methods[keyComputed]).set
        }

        Object.defineProperty(this, keyComputed, {
          get: get,
          set: set
        })
      }
    }

  }

  store(key:string, value?:any) {
    return (<Boilerplate>this.boilerplate).store(key, value)
  }

  shared_store(key:string, value?:any) {
    return (<Boilerplate>this.boilerplate).root.store(key, value)
  }

  static create<Data = object, Methods = object, Computed = object>(options:ThisTypedAPIOptions<API, Data, Methods, Computed>) : CombinedAPIInstance<API, Data, Methods, Computed> {
    options = Object.assign({}, APIDefaults, options || {})
    const ctor = API as APIConstructor
    return new ctor(options)
  }

}