import { Boilerplate } from "../boilerplate/boilerplate";


export type DefaultData<A> = object | ((this: A) => object)
export type DefaultMethods<A> = { [key:string]: (this: A, ...args: any[]) => any }
export type DefaultComputed = { [key:string]: any }

export type Accessors<T> = {
  [K in keyof T]: (() => T[K]) | { get?(): T, set?(value: T): void }
}

export interface APIOptions<A, Data=DefaultData<A>, Methods=DefaultMethods<A>, Helpers=DefaultMethods<A>, Computed=DefaultComputed> {
  data?: Data
  methods?: Methods
  helpers?: Helpers
  computed?: Accessors<Computed>

  init?(): void
  bundle?(): any
}

export type ThisTypedAPIOptions<A, Data, Methods, Helpers, Computed> =
  object
  & APIOptions<A, Data, Methods, Helpers, Computed>
  & ThisType<CombinedAPIInstance<A, Data, Methods, Helpers, Computed>>

export type CombinedAPIInstance<Instance, Data, Methods, Helpers, Computed> = Data & Methods & Helpers & Computed & Instance

export class API {

  boilerplate?: Boilerplate

  store(key:string, value?:any) {
    return (<Boilerplate>this.boilerplate).store(key, value)
  }

  shared_store(key:string, value?:any) {
    return (<Boilerplate>this.boilerplate).root.store(key, value)
  }

  static create<Data = object, Methods = object, Helpers = object, Computed = object>(options?: ThisTypedAPIOptions<API, Data, Methods, Helpers, Computed>) : CombinedAPIInstance<API, Data, Methods, Helpers, Computed> {
    return new API as CombinedAPIInstance<API, Data, Methods, Helpers, Computed>
  }
}

