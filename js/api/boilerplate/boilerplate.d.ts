import { Boilerplate } from '../../boilerplate/boilerplate';
import { API } from "../api";
import { ConfigureGroup } from "../../stack/configure-group";
export declare class BoilerplateAPI extends API {
    init(): void;
    bundle(): void;
    helpers(): {
        api: (type?: string) => any;
        stack: (type?: string) => ConfigureGroup;
        store: (type: string) => {
            get: (key: string) => any;
            set: (key: string, value: any) => any;
        };
        output: (str?: string | undefined) => string;
    };
    getBoilerplate(type?: string): Boilerplate;
    api(type?: string): any;
    stack(type?: string): ConfigureGroup;
    store(type: string): {
        get: (key: string) => any;
        set: (key: string, value: any) => any;
    };
    output(str?: string): string;
}
