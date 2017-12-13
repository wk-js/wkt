export declare class Order {
    order: string[];
    constructor();
    exists(key: string): boolean;
    index(key: string): number;
    add(key: string): void;
    before(bfore: string, key: string): void;
    after(after: string, key: string): void;
    reorder(fk: string, tk: string): void;
    execute(reducer?: Function): void;
}
export interface ConfigureTasks {
    [key: string]: Function;
}
export declare class Configure extends Order {
    tasks: ConfigureTasks;
    add(key: string, action?: Function): void;
}
export default Order;
