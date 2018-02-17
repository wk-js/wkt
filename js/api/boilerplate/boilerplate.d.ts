import { API } from "../api";
import { Configure } from "../../stack/configure";
export declare class BoilerplateAPI extends API {
    init(): void;
    bundle(): void;
    helpers(): {
        LocalAPI: () => Configure;
        RootAPI: () => any;
        LocalStack: () => Configure;
        RootStack: () => Configure;
        output: (str?: string | undefined) => string;
    };
    LocalAPI(): Configure;
    RootAPI(): any;
    LocalStack(): Configure;
    RootStack(): Configure;
    output(str?: string): string;
}
