import { API } from "../index";
import { Configure } from "../../stack/configure";
export declare class StackAPI extends API {
    init(): void;
    bundle(): void;
    helpers(): {
        add: (key: string | Function, fn?: Function | undefined) => void;
        before: (bfore: string, key: string | Function, fn?: Function | undefined) => void;
        after: (after: string, key: string | Function, fn?: Function | undefined) => void;
        invocator: () => Configure;
        output: (str?: string | undefined) => string;
    };
    stack(): Configure;
    add(key: string | Function, fn?: Function): void;
    before(bfore: string, key: string | Function, fn?: Function): void;
    after(after: string, key: string | Function, fn?: Function): void;
    invocator(): Configure;
    output(str?: string): string;
}
