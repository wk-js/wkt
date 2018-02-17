/// <reference types="when" />
import { Configure } from './stack/configure';
import * as when from 'when';
import { Resolver } from './resolver/index';
export declare class Boilerplate {
    input: string;
    output: string;
    static Resolver: Resolver<string>;
    configs: {
        [key: string]: any;
    };
    stores: {
        [key: string]: any;
    };
    stack: Configure;
    path: string;
    api: any;
    parent: Boilerplate | null;
    children: Boilerplate[];
    constructor(input: string, output: string);
    readonly src_path: string;
    readonly dst_path: string;
    readonly current_task: string;
    readonly root: Boilerplate;
    readonly is_root: boolean;
    config(key: string, value?: any): any | undefined;
    store(key: string, value?: any): any | undefined;
    resolve(): when.Promise<null>;
    parse(pth: string): When.Promise<null>;
    resolveAPIs(content: string): when.Promise<void>;
    resolveSources(content: string): when.Promise<{}>;
    bundle(): when.Promise<null>;
    execute(): When.Promise<boolean>;
}
