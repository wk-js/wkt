import { API } from "../index";
export interface FileAPIItem {
    file: string;
    action: string;
    context: string;
    output?: string;
}
export declare function getAPIClass(): typeof FileAPI;
export declare class FileAPI extends API {
    readonly globs: FileAPIItem[];
    init(): void;
    bundle(): any;
    helpers(): {
        file: (file: string, parameters: FileAPIItem) => void;
        copy: (file: string, output?: string | undefined) => void;
        remove: (file: string) => void;
        rename: (file: string, output: string) => void;
        move: (file: string, output: string) => void;
        ignore: (file: string) => void;
    };
    file(file: string, parameters: FileAPIItem): void;
    copy(file: string, output?: string): void;
    remove(file: string): void;
    move(file: string, output: string): void;
    rename(file: string, output: string): void;
    ignore(file: string): void;
    bundle_copy(): any;
    bundle_apply(): any[];
}
