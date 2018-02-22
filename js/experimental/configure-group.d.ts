/// <reference types="when" />
import { OrderGroup } from './order-group';
export interface ConfigureGroupTasks {
    [key: string]: Function;
}
export declare class ConfigureGroup extends OrderGroup {
    tasks: ConfigureGroupTasks;
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
    execute(hooks?: any): When.Promise<void>;
    private generateName(key);
}
