import { Order } from './order';
export interface ConfigureTasks {
    [key: string]: Function;
}
export declare class Configure extends Order {
    tasks: ConfigureTasks;
    counter: {
        [key: string]: number;
    };
    currentTask: string | null;
    readonly running: boolean;
    _addTask(key: string, action?: Function): void;
    add(key: string, action?: Function): void;
    before(bfore: string, key: string, action?: Function): void;
    after(after: string, key: string, action?: Function): void;
    insert(action?: Function): void;
    insertBefore(bfore: string, action?: Function): void;
    insertAfter(after: string, action?: Function): void;
    execute(hooks?: any): any;
    private generateName(key);
}
