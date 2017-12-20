/// <reference types="node" />
import { Writable } from "stream";
export declare class MemoryStream extends Writable {
    key: string;
    constructor(key: string);
    _write(chunk: Buffer | any, enc: string, cb: Function): void;
    getData(encoding?: string): string | Buffer;
    clean(): void;
}
