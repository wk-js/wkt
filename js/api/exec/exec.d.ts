import { API } from "..";
import { Subprocess } from "./subprocess";
export declare class ExecAPI extends API {
    subprocesses: Subprocess[];
    init(): void;
    bundle(): any;
    helpers(): {
        exec: (command: string, options?: any) => any;
        execSync: (command: string, options?: any) => any;
    };
    exec(command: string, options?: any): any;
    execSync(command: string, options?: any): any;
}
