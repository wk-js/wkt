import { API, APIConstructor } from './api';
export declare const ExecAPI: APIConstructor<object & {
    exec(command: string, options?: any): any;
    execSync(command: string, options?: any): any;
} & API>;
