import { API } from "../api";
export declare class PromptAPI extends API {
    readonly answers: {
        [key: string]: any;
    };
    readonly questions: {
        [key: string]: any;
    };
    init(): void;
    bundle(): void;
    helpers(): {
        ask: (message: string, variable: string, options?: any) => any;
        prompt: (message: string, variable: string, options?: any) => any;
        answer: (variable: string) => any;
        choices: (message: string, variable: string, list: string[], options?: any) => any;
    };
    ask(message: string, variable: string, options?: any): any;
    prompt(message: string, variable: string, options?: any): any;
    choices(message: string, variable: string, list: string[], options?: any): any;
    answer(variable: string): any;
}
