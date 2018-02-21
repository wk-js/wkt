import { Boilerplate } from '..';
export declare type CombinedAPIInstance<Instance extends API, Data, Methods, Computed> = Data & Methods & Computed & Instance;
export declare type ThisTypedAPIOptions<A extends API, Data, Methods, Computed> = object & APIOptions<A, Data | ((this: Readonly<Record<string, any> & A>) => Data), Methods, Computed> & ThisType<CombinedAPIInstance<A, Data, Methods, Computed>>;
/**
 * When the `Computed` type parameter on `ComponentOptions` is inferred,
 * it should have a property with the return type of every get-accessor.
 * Since there isn't a way to query for the return type of a function, we allow TypeScript
 * to infer from the shape of `Accessors<Computed>` and work backwards.
 */
export declare type Accessors<T> = {
    [K in keyof T]: (() => T[K]) | APIComputedOptions<T[K]>;
};
export interface APIComputedOptions<T> {
    get?(): T;
    set?(value: T): void;
}
export interface APIHelpers<A> {
    [key: string]: (this: A, ...args: any[]) => any;
}
export declare type APIDefaultData<A> = object | ((this: A) => object);
export declare type APIDefaultMethods<A> = {
    [key: string]: (this: A, ...args: any[]) => any;
};
export declare type APIDefaultComputed = {
    [key: string]: any;
};
export interface APIOptions<A extends API, Data = APIDefaultData<A>, Methods = APIDefaultMethods<A>, Computed = APIDefaultComputed> {
    data?: Data;
    methods?: Methods;
    computed?: Accessors<Computed>;
    init?(): void;
    bundle?(): void;
    helpers?(): APIHelpers<A>;
}
export interface APIConstructor<A extends API = API> {
    new <Data = object, Methods = object, Computed = object>(options?: ThisTypedAPIOptions<A, Data, Methods, Computed>): CombinedAPIInstance<A, Data, Methods, Computed>;
    create<Data, Methods, Computed>(options?: ThisTypedAPIOptions<A, Data, Methods, Computed>): CombinedAPIInstance<A, Data, Methods, Computed>;
}
export declare class API<Data = object, Methods = object, Computed = object> {
    boilerplate?: Boilerplate;
    constructor(options?: ThisTypedAPIOptions<API, Data, Methods, Computed>);
    store(key: string, value?: any): any;
    shared_store(key: string, value?: any): any;
    static create<Data = object, Methods = object, Computed = object>(options: ThisTypedAPIOptions<API, Data, Methods, Computed>): CombinedAPIInstance<API, Data, Methods, Computed>;
}
