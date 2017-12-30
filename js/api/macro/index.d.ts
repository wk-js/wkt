import { API } from "../index";
export declare class MacroAPI extends API {
    readonly macros: any;
    init(): void;
    bundle(): void;
    helpers(): {
        macro: (key?: string | undefined, ...args: any[]) => any;
    };
    setMacro(key: string, macro: Function): void;
    getMacro(key: string, ...args: any[]): any;
    macro(key?: string, ...args: any[]): any;
}
