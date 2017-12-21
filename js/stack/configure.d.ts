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
    add(key: string | Function, action?: Function): void;
    before(bfore: string, key: string | Function, action?: Function): void;
    after(after: string, key: string | Function, action?: Function): void;
    first(key: string | Function, action?: Function): void;
    last(key: string | Function, action?: Function): void;
    execute(hooks?: any): any;
    private generateName(key);
}
