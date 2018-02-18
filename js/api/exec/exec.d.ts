import { API } from "../api";
export declare class ExecAPI extends API {
    init(): void;
    bundle(): void;
    helpers(): {
        exec: (command: string, options?: any) => any;
        execSync: (command: string, options?: any) => any;
    };
    exec(command: string, options?: any): any;
    execSync(command: string, options?: any): any;
}
