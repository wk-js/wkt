export declare class Order {
    order: string[];
    rules: {
        [key: string]: any;
    };
    constructor();
    exists(key: string): boolean;
    index(key: string): number;
    _add(key: string): void;
    before(bfore: string, key: string): void;
    after(after: string, key: string): void;
    add(key: string): void;
    rule(direction: string, keyRule: string, key: string): void;
    refreshRules(): void;
    updateRules(key: string, relative: string, direction: string): void;
    reorder(): void;
}
