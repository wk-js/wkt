import { API } from "..";
export declare class TemplateAPI extends API {
    readonly globs: any[];
    chunks: any;
    init(): void;
    bundle(): any;
    helpers(): {
        template: (file: string, options?: any) => void;
        chunk: (key: string, value: any) => void;
    };
    template(file: string, options?: any): void;
    chunk(key: string, value: any): void;
}
