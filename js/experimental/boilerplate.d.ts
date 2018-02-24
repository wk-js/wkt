import { API, APIConstructor } from './api';
import { Boilerplate } from '../boilerplate/boilerplate';
import { ConfigureGroup } from '../stack/configure-group';
export declare const BoilerplateAPI: APIConstructor<object & {
    getBoilerplate(type?: string): Boilerplate;
    api(type?: string): any;
    stack(type?: string): ConfigureGroup;
    store(type: string): {
        get: (key: string) => any;
        set: (key: string, value: any) => any;
    };
    output(str?: string | undefined): string;
} & API>;
