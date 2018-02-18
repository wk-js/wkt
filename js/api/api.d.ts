/// <reference types="when" />
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
    abstract bundle(): any | When.Promise<any>;
    abstract helpers(): {
        [key: string]: Function;
    };
    readonly current_task: string;
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
    static bundle(boilerplate: Boilerplate): When.Promise<null>;
}
