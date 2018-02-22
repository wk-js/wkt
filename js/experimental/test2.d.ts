/// <reference types="when" />
/// <reference types="node" />
import { API } from './test';
import { AssetItemRules } from 'asset-pipeline/js/asset-pipeline';
import { ChunkStack } from '../api/file/chunk_stack';
import { TemplateOptions } from "lodash";
export declare const FileAPI: object & {
    bundle(): When.Promise<boolean>;
    _copyAndRender(): When.Promise<boolean | null>;
    bundle_copy(): When.Promise<{} | null>;
    bundle_render(): When.Promise<boolean | null>;
} & {
    addFile(glob: string, parameters?: AssetItemRules | undefined): void;
    ignoreFile(glob: string): void;
    addDirectory(glob: string, parameters?: AssetItemRules | undefined): void;
    ignoreDirectory(glob: string): void;
    templateFile(glob: string, template?: boolean | object | undefined): void;
    templateData(data: object, options?: TemplateOptions | undefined): object;
    editFile(glob: string, callback: (value: string | Buffer) => string | Buffer): void;
    chunk(): ChunkStack;
} & {
    data: any;
    assets: any;
    chunk_stack: any;
    asset: any;
} & API;
