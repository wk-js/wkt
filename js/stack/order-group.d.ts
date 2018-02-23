import { Order } from './order';
export declare class OrderGroup extends Order {
    groups: {
        [key: string]: OrderGroup;
    };
    group(key: string): OrderGroup;
    getFullOrder(): string[];
}
