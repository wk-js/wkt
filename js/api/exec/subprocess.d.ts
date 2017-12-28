/// <reference types="node" />
import { ChildProcess, SpawnSyncReturns } from 'child_process';
import { MemoryStream } from '../../utils/memory-stream';
export declare class Subprocess {
    command: string;
    options: any;
    id: number;
    ps: ChildProcess | null;
    stdoutStream: MemoryStream | undefined;
    stderrStream: MemoryStream | undefined;
    promise: any;
    streamPromise: any;
    resolve: Function;
    reject: Function;
    status: string;
    processOptions: any;
    constructor(command: string, options?: any);
    prepare(): void;
    execute(): any;
    executeSync(): SpawnSyncReturns<Buffer> | SpawnSyncReturns<string> | undefined;
    executeAsync(): any;
    kill(): void;
    activate(): void;
    desactivate(): void;
    _onStdOutData(data: Buffer): void;
    _onStdErrData(data: Buffer): void;
    private _onError(value);
    private _onExit(code, signal, err);
    static create(command: string, options?: any): Subprocess;
    static execute(command: string, options?: any): any;
}
