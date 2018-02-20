/// <reference types="when" />
import { Boilerplate } from "..";
import when from 'when';
export declare function parse(boilerplate: Boilerplate, content: string, throwOnError?: boolean): void;
export declare function get_imports(key: string, content: string, path: string): when.Promise<string[]>;
export declare function fetch_optionals(paths: string[], optionals: string[]): when.Promise<string[]>;
