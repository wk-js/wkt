import { API } from "../api";
import { Configure } from "../../stack/configure";
export declare class BoilerplateAPI extends API {
    init(): void;
    bundle(): void;
    helpers(): {
        LocalAPI: () => Configure;
        LocalStack: () => Configure;
        LocalStore: (key: string, value?: any) => any;
        RootAPI: () => any;
        RootStack: () => Configure;
        RootStore: (key: string, value?: any) => any;
        output: (str?: string | undefined) => string;
    };
    LocalAPI(): Configure;
    RootAPI(): any;
    LocalStack(): Configure;
    RootStack(): Configure;
    LocalStore(key: string, value?: any): any;
    RootStore(key: string, value?: any): any;
    output(str?: string): string;
}
