import { API } from "../../index";
export declare class PromptAPI extends API {
    answers: any;
    readonly questions: any[];
    init(): void;
    bundle(): any;
    helpers(): {
        ask: (message: string, variable: string, options?: any) => void;
        prompt: (message: string, variable: string) => void;
        answer: (variable: string) => any;
    };
    ask(message: string, variable: string, options?: any): void;
    prompt(message: string, variable: string): void;
    answer(variable: string): any;
}
