/// <reference types="node" />
import { EventEmitter } from 'events';
export declare class Renderer extends EventEmitter {
    input: string;
    output: string;
    ejs: any;
    options: any;
    data: any;
    includes: string[];
    enableWatch: boolean;
    /**
     * Create a new template
     *
     * @param {String} input - Path the input file
     * @param {String} ouput - Path the output file
     */
    constructor(input: string, output: string);
    /**
     * Render
     */
    render(): void;
    include(pth: string): any;
    require(pth: string): any;
    watch(child: string, parent: string): void;
    /**
     * Render a source
     *
     * @param {String} src
     */
    renderSource(src: string): any;
    /**
     * Render
     *
     * @param {String} src
     * @param {Object} options
     * @param {Object} data
     */
    static render: (src: string, options: any, data?: any) => any;
    static include: (pth: string, options: any, data?: any) => any;
    static require: (pth: string, options: any) => any;
}
