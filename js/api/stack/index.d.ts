import { API } from "../index";
import { Configure } from "../../stack/configure";
export declare class StackAPI extends API {
    init(): void;
    bundle(): void;
    helpers(): {
        stack: () => Configure;
        invocator: () => Configure;
        output: (str?: string | undefined) => string;
    };
    stack(): Configure;
    invocator(): Configure;
    output(str?: string): string;
}
