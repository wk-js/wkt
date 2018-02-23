import { Boilerplate } from "../boilerplate/boilerplate";
import { Resolver } from "../resolver";
export declare type DefaultData<A> = object | ((this: A) => object);
export declare type DefaultMethods<A> = {
    [key: string]: (this: A, ...args: any[]) => any;
};
export declare type DefaultComputed = {
    [key: string]: any;
};
export declare type Accessors<T> = {
    [K in keyof T]: (() => T[K]) | {
        get?(): T;
        set?(value: T): void;
    };
};
export interface APIOptions<A, Data = DefaultData<A>, Methods = DefaultMethods<A>, Computed = DefaultComputed> {
    data?: Data;
    methods?: Methods;
    computed?: Accessors<Computed>;
    init?(): void;
    bundle?(): any;
    helpers?(): {
        [key: string]: Function;
    };
}
export declare type ThisTypedAPIOptions<A extends API, Data, Methods, Computed> = object & APIOptions<A, Data, Methods, Computed> & ThisType<CombinedAPIInstance<A, Data, Methods, Computed>>;
export declare type CombinedAPIInstance<Instance extends API, Data, Methods, Computed> = Data & Methods & Computed & Instance;
export declare type ExtendedAPI<Instance extends API, Data, Methods, Computed> = APIConstructor<CombinedAPIInstance<Instance, Data, Methods, Computed> & API>;
export interface APIConstructor<A extends API> {
    new <Data = object, Methods = object, Computed = object>(options?: ThisTypedAPIOptions<API, Data, Methods, Computed>): CombinedAPIInstance<API, Data, Methods, Computed>;
    extend<Data = object, Methods = object, Computed = object>(name: string, options?: ThisTypedAPIOptions<API, Data, Methods, Computed>): ExtendedAPI<API, Data, Methods, Computed>;
}
export declare class API {
    static Resolver: Resolver<new (...args: any[]) => API>;
    boilerplate?: Boilerplate;
    name: string;
    protected _lifecycle: {
        [key: string]: Function;
    };
    constructor(options?: ThisTypedAPIOptions<API, object, object, object>);
    store(key: string, value?: any): any;
    shared_store(key: string, value?: any): any;
    configure(bp: Boilerplate): void;
    static create<Data = object, Methods = object, Computed = object>(options?: ThisTypedAPIOptions<API, Data, Methods, Computed>): CombinedAPIInstance<API, Data, Methods, Computed>;
    static extend<Data = object, Methods = object, Computed = object>(name: string, options?: ThisTypedAPIOptions<API, Data, Methods, Computed>): ExtendedAPI<API, Data, Methods, Computed>;
    static configure(boilerplate: Boilerplate, api_list: string[]): {
        apis: {
            [key: string]: API;
        };
        helpers: {
            [key: string]: Function;
        };
    };
}
