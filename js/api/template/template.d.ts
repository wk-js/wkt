import { API } from "..";
import { ChunkStack } from './chunk_stack';
export declare class TemplateAPI extends API {
    readonly globs: any[];
    chunk_stack: ChunkStack;
    init(): void;
    bundle(): any;
    helpers(): {
        template: (file: string, options?: any) => void;
        chunkAdd: (key: string, chunk: string) => void;
        chunkBefore: (bfore: string, key: string, chunk: string) => void;
        chunkAfter: (after: string, key: string, chunk: string) => void;
    };
    template(file: string, options?: any): void;
    chunkAdd(key: string, chunk: string): void;
    chunkBefore(bfore: string, key: string, chunk: string): void;
    chunkAfter(after: string, key: string, chunk: string): void;
}
