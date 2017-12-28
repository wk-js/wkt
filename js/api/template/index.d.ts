import { API } from "..";
import { ChunkStack } from './chunk_stack';
import { Boilerplate } from "../..";
export declare class TemplateSingleton extends API {
    chunk_stack: ChunkStack;
    data: any;
    constructor(boilerplate: Boilerplate);
    readonly globs: any;
    store(key: string, value?: any): any;
    init(): void;
    bundle(): void;
    helpers(): {
        template: (file: string, options?: any) => void;
        templateData: (data: any) => void;
        chunkAdd: (key: string, chunk: string) => void;
        chunkBefore: (bfore: string, key: string, chunk: string) => void;
        chunkAfter: (after: string, key: string, chunk: string) => void;
    };
    afterRootBundle(): any;
    template(file: string, options?: any): void;
    templateData(data: any): void;
    chunkAdd(key: string, chunk: string): void;
    chunkBefore(bfore: string, key: string, chunk: string): void;
    chunkAfter(after: string, key: string, chunk: string): void;
    static templates: {
        [key: string]: TemplateSingleton;
    };
}
export declare class TemplateAPI extends API {
    readonly singleton: TemplateSingleton;
    init(): void;
    bundle(): void;
    helpers(): {
        [key: string]: Function;
    };
}
