import { Boilerplate } from "../boilerplate/boilerplate";
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
export interface APIOptions<A, Data = DefaultData<A>, Methods = DefaultMethods<A>, Helpers = DefaultMethods<A>, Computed = DefaultComputed> {
    data?: Data;
    methods?: Methods;
    helpers?: Helpers;
    computed?: Accessors<Computed>;
    init?(): void;
    bundle?(): any;
    helperss?(): {
        [key: string]: Function;
    };
}
export declare type ThisTypedAPIOptions<A, Data, Methods, Helpers, Computed> = object & APIOptions<A, Data, Methods, Helpers, Computed> & ThisType<CombinedAPIInstance<A, Data, Methods, Helpers, Computed>>;
export declare type CombinedAPIInstance<Instance, Data, Methods, Helpers, Computed> = Data & Methods & Helpers & Computed & Instance;
export declare class API {
    boilerplate?: Boilerplate;
    store(key: string, value?: any): any;
    shared_store(key: string, value?: any): any;
    static create<Data = object, Methods = object, Helpers = object, Computed = object>(options?: ThisTypedAPIOptions<API, Data, Methods, Helpers, Computed>): CombinedAPIInstance<API, Data, Methods, Helpers, Computed>;
}
