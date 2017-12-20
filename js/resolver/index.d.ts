export declare class Resolver<T> {
    resolver: Function;
    sources: {
        [key: string]: T;
    };
    constructor(resolver: Function);
    resolve(pathOrIdOrRepo: string): any;
    get(id: string): T | null;
    register(id: string, item: T): void;
    private resolveId(iterator);
    private resolvePath(iterator);
    private resolveRepository(iterator);
}
