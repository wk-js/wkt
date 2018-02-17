/// <reference types="when" />
export declare function prompt(message: string, options?: any): When.Promise<string>;
export declare function ask(message: string, options?: any): When.Promise<boolean>;
export declare function choices(message: string, answers: string[], options?: any): When.Promise<string>;
