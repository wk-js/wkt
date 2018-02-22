import { Order } from '../stack/order';
export interface OrderGroupObject {
    group: string;
    path: string;
    items: string[];
    root: string;
}
export declare class OrderGroup extends Order {
    constructor();
    add(key: string): void;
    before(bfore: string, key: string): void;
    after(after: string, key: string): void;
    get(key: string): string[];
    parse(key: string): OrderGroupObject;
}
