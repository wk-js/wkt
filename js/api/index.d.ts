import { Boilerplate } from '../boilerplate';
import { Resolver } from '../resolver/index';
export interface APIStore {
    [key: string]: any;
}
export declare abstract class API {
    boilerplate: Boilerplate;
    static Resolver: Resolver<new (...args: any[]) => API>;
    stores: APIStore;
    constructor(boilerplate: Boilerplate);
    abstract init(): void;
    abstract bundle(): void;
    abstract helpers(): {
        [key: string]: Function;
    };
    readonly current_bundle: string;
    store(key: string, value?: any): any;
    shared_store(key: string, value?: any): any;
    fromSource(str: string): string;
    fromDestination(str: string): string;
    toSource(dst: string): string;
    toDestination(src: string): string;
    static create(boilerplate: Boilerplate, api_list: string[]): {
        apis: {
            [key: string]: API;
        };
        helpers: {
            [key: string]: Function;
        };
    };
    static bundle(boilerplate: Boilerplate): any;
    static resolve(paths: string[]): any;
}
