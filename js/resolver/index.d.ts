/// <reference types="when" />
import * as when from 'when';
export declare class Resolver<T> {
    private resolver;
    sources: {
        [key: string]: T;
    };
    constructor(resolver: Function);
    resolve(pathOrIdOrRepo: string, relativeTo: string): when.Promise<T>;
    get(id: string): T | null;
    register(id: string, item: T): void;
    private resolveId(iterator);
    private resolvePath(iterator);
    private resolveRepository(iterator);
}
