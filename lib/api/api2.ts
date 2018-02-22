import Vue from 'vue'
import { merge } from "lol/utils/object";
import { Boilerplate } from '..';

// export type CombinedAPIInstance<Instance extends $API, Data, Methods, Computed> = Data & Methods & Computed & Instance

// export type ThisTypedAPIOptions<A extends $API, Data, Methods, Computed> =
//   object
//   & APIOptions<A, Data | ((this: Readonly<Record<never, any> & A>) => Data), Methods, Computed>
//   & ThisType<CombinedAPIInstance<A, Data, Methods, Computed>>

export type CombinedAPIInstance<Instance, Data, Methods, Computed> = Data & Methods & Computed & Instance

export type ThisTypeAPIOptions<A, Data, Methods, Computed> =
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

export interface APIOptions<
  A,
  Data,
  Methods,
  Computed
> {
  data?:Data
  methods?:Methods
  computed?:Accessors<Computed>

  init?(): void
  bundle?(): void
  helpers?(): APIHelpers<A>
}

// export interface $API {
//   boilerplate?: Boilerplate
//   store(key:string, value?:any) : any
//   shared_store(key:string, value?:any) : any
// }

// export interface APIConstructor<A extends $API = $API> {
//   new <Data = object, Methods = object, Computed = object>(options?: ThisTypedAPIOptions<A, Data, Methods, Computed>) : CombinedAPIInstance<A, Data, Methods, Computed>

//   create<Data, Methods, Computed>(options?: ThisTypedAPIOptions<A, Data, Methods, Computed>) : CombinedAPIInstance<A, Data, Methods, Computed>
// }

function NOOP() { return {} }
const APIDefaults = {
  computed: {},
  methods: {},
  data: NOOP,
  helpers: NOOP,
  init: NOOP,
  bundle: NOOP
}

// export class API<Data = object, Methods = object, Computed = object> {
//   boilerplate?: Boilerplate
//   constructor(options?:ThisTypedAPIOptions<API, Data, Methods, Computed>) {
//     if (options) {
//       // Init data
//       const data = options.data as Data
//       if (typeof data === 'function') {
//         merge( this, (<Function>data).call(this) )
//       } else if (typeof data === 'object' && !Array.isArray(data)) {
//         merge( this, data )
//       }
//       // Init methods
//       const methods = options.methods as Methods
//       for (const keyMethod in methods) {
//         (<any>this)[keyMethod] = (<any>methods)[keyMethod].bind(this)
//       }
//       // Init helpers
//       const helpers = options.helpers as () => APIHelpers<API>
//       (<any>this)['helpers'] = helpers.bind(this)
//       // Init computed
//       const computed = options.computed as Accessors<Computed>
//       for (const keyComputed in methods) {
//         let get, set
//         if (typeof methods[keyComputed] === 'function') {
//           get = methods[keyComputed]
//         } else if (typeof methods[keyComputed] === 'object') {
//           get = (<any>methods[keyComputed]).get
//           set = (<any>methods[keyComputed]).set
//         }
//         Object.defineProperty(this, keyComputed, {
//           get: get,
//           set: set
//         })
//       }
//     }
//   }
//   store(key:string, value?:any) {
//     return (<Boilerplate>this.boilerplate).store(key, value)
//   }
//   shared_store(key:string, value?:any) {
//     return (<Boilerplate>this.boilerplate).root.store(key, value)
//   }
//   static create<Data = object, Methods = object, Computed = object>(options?:ThisTypedAPIOptions<API, Data, Methods, Computed>) : CombinedAPIInstance<API, Data, Methods, Computed> {
//     options = Object.assign({}, APIDefaults, options || {})
//     const ctor = API as APIConstructor
//     return new ctor(options)
//   }
// }
export class API {

  boilerplate?: Boilerplate | undefined;

  store(key: string, value?: any) {
    return (<Boilerplate>this.boilerplate).store(key, value)
  }

  shared_store(key: string, value?: any) {
    return (<Boilerplate>this.boilerplate).root.store(key, value)
  }

  static create<Data = object, Methods = object, Computed = object>(options?:ThisTypeAPIOptions<API, Data, Methods, Computed>) {
    return new API as CombinedAPIInstance<API, Data, Methods, Computed>
  }

}



const c = API.create({

  data() {
    return { id: 'id' }
  },

  computed: {

    data() : object {
      return this.shared_store('file:data') ?
      this.shared_store('file:data') : 
      this.shared_store('file:data', {})
    },

    assets() : string[] {
      return this.shared_store('file:assets') ?
      this.shared_store('file:assets') : 
      this.shared_store('file:assets', [])
    },

    chunk_stack() : Buffer {
      return this.shared_store('file:chunk') ?
      this.shared_store('file:chunk') : 
      this.shared_store('file:chunk', new Buffer(''))
    },

    asset() : string {
      if (this.store('file:current_asset')) {
        return this.store('file:current_asset')
      }

      const asset = ''
      this.store('file:current_asset', asset)
      this.assets.push( asset )

      return asset
    }

  },

  methods: {

    message() {
      this.assets
    }

  }

})

const v = new Vue({

  computed: {

    hello() {
      return 'lol'
    }

  },

  methods: {

    message() {
      this.hello
    }

  }


})