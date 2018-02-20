/// <reference types="when" />
import { Configure } from '../stack/configure';
import when from 'when';
import { Resolver } from '../resolver/index';
export declare class Boilerplate {
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
    name: string;
    parent: Boilerplate | null;
    children: Boilerplate[];
    constructor(_output: string);
    readonly src_path: string;
    readonly dst_path: string;
    readonly absolute_src_path: string;
    readonly absolute_dst_path: string;
    readonly current_task: string;
    readonly root: Boilerplate;
    readonly is_root: boolean;
    setOutput(output: string): string;
    store(key: string, value?: any): any | undefined;
    bundle(): when.Promise<null>;
    resolve(input: string, relativeTo?: string): when.Promise<null>;
    parse(pth: string): When.Promise<null>;
    resolveAPIs(apis: string[], content: string): when.Promise<void>;
    resolveSources(sources: string[]): when.Promise<string[]>;
    getUsedAPIs(): any[];
    execute(): When.Promise<boolean>;
}
