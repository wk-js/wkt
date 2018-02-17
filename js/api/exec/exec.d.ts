/// <reference types="when" />
import { API } from "../api";
import { Subprocess } from "./subprocess";
export declare class ExecAPI extends API {
    subprocesses: Subprocess[];
    init(): void;
    bundle(): When.Promise<never[]>;
    helpers(): {
        exec: (command: string, options?: any) => any;
        execSync: (command: string, options?: any) => any;
    };
    exec(command: string, options?: any): any;
    execSync(command: string, options?: any): any;
}
