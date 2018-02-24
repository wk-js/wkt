/// <reference types="when" />
import { Configure } from './configure';
export declare class ConfigureGroup extends Configure {
    groups: {
        [key: string]: ConfigureGroup;
    };
    group(key: string): ConfigureGroup;
    getFullOrder(): string[];
    getGroupTasks(key: string): {
        key: string;
        action: Function;
    }[];
    execute(hooks?: any): When.Promise<void>;
}
