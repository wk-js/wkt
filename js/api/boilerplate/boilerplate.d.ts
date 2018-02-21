import { Boilerplate } from '../../boilerplate/boilerplate';
import { API } from "../api";
import { Configure } from "../../stack/configure";
export declare class BoilerplateAPI extends API {
    init(): void;
    bundle(): void;
    helpers(): {
        api: (type?: string) => any;
        stack: (type?: string) => Configure;
        store: (type: string) => {
            get: (key: string) => any;
            set: (key: string, value: any) => any;
        };
        output: (str?: string | undefined) => string;
    };
    getBoilerplate(type?: string): Boilerplate;
    api(type?: string): any;
    stack(type?: string): Configure;
    store(type: string): {
        get: (key: string) => any;
        set: (key: string, value: any) => any;
    };
    output(str?: string): string;
}
