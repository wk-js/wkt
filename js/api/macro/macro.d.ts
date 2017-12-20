import { API } from "../index";
export declare function getAPIClass(): typeof MacroAPI;
export declare class MacroAPI extends API {
    readonly macros: any;
    init(): void;
    bundle(): void;
    helpers(): {
        macro: (key: string, ...args: any[]) => any;
    };
    createMacro(key: string, macro: Function): void;
    macro(key: string, ...args: any[]): any;
}
