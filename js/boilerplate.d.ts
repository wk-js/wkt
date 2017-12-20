import { API } from './api/index';
import { Configure } from './stack/configure';
import { Resolver } from './resolver/index';
export declare class Boilerplate {
    input: string;
    output: string;
    static Resolver: Resolver<string>;
    configs: {
        [key: string]: any;
    };
    stack: Configure;
    path: string;
    api: {
        apis: {
            [key: string]: API;
        };
        helpers: {
            [key: string]: Function;
        };
    };
    children: Boilerplate[];
    constructor(input: string, output: string);
    readonly src_path: string;
    readonly dst_path: string;
    readonly current_bundle: string;
    config(key: string, value?: any): any | undefined;
    resolve(): any;
    parse(pth: string): any;
    resolveAPIs(content: string): any;
    resolveSources(content: string): any;
    execute(): any;
}
