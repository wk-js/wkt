/// <reference types="node" />
export declare function isFile(path: string): boolean;
export declare function isDirectory(path: string): boolean;
export declare function copy(fromFile: string, toFile: string): any;
export declare function remove(file: string): any;
export declare function move(fromFile: string, toFile: string): any;
export declare function rename(fromFile: string, toFile: string): any;
export declare function ensureDir(path: string): any;
export declare function fetch(include: string | string[], exclude?: string | string[]): string[];
export declare function fetchDirs(include: string | string[], exclude?: string | string[]): string[];
export declare function writeFile(content: string | Buffer, file: string): any;
export declare function readFile(file: string): any;
export declare function editFile(file: string, callback: Function): any;
