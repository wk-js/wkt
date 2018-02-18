/// <reference types="when" />
import { Configure } from './stack/configure';
import when from 'when';
import { Resolver } from './resolver/index';
export declare class Boilerplate {
    private _input;
    private _output;
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
    print: any;
    constructor(_input: string, _output: string);
    readonly src_path: string;
    readonly dst_path: string;
    readonly absolute_src_path: string;
    readonly absolute_dst_path: string;
    readonly current_task: string;
    readonly root: Boilerplate;
    readonly is_root: boolean;
    setOutput(output: string): string;
    config(key: string, value?: any): any | undefined;
    store(key: string, value?: any): any | undefined;
    resolve(): when.Promise<null>;
    parse(pth: string): When.Promise<null>;
    resolveAPIs(content: string): when.Promise<void>;
    resolveSources(content: string): when.Promise<{}>;
    bundle(): when.Promise<null>;
    getUsedAPIs(): any[];
    execute(): When.Promise<boolean>;
}
