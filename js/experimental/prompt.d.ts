import { API, APIConstructor } from './api';
export declare const PromptAPI: APIConstructor<object & {
    ask(message: string, variable: string, options?: any): any;
    prompt(message: string, variable: string, options?: any): any;
    choices(message: string, variable: string, list: string[], options?: any): any;
    answer(variable: string): any;
} & {
    answers: any;
    questions: any;
} & API>;
