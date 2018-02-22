"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api2_1 = require("../api2");
const chunk_stack_1 = require("./chunk_stack");
const asset_pipeline_1 = require("asset-pipeline/js/asset-pipeline");
const object_1 = require("lol/utils/object");
exports.FileAPI = api2_1.API.create({
    computed: {
        data() {
            return this.shared_store('file:data') ?
                this.shared_store('file:data') :
                this.shared_store('file:data', {});
        },
        assets() {
            return this.shared_store('file:assets') ?
                this.shared_store('file:assets') :
                this.shared_store('file:assets', []);
        },
        chunk_stack() {
            return this.shared_store('file:chunk') ?
                this.shared_store('file:chunk') :
                this.shared_store('file:chunk', new chunk_stack_1.ChunkStack);
        },
        asset() {
            if (this.store('file:current_asset')) {
                return this.store('file:current_asset');
            }
            const asset = new asset_pipeline_1.AssetPipeline;
            this.store('file:current_asset', asset);
            this.assets.push(asset);
            return asset;
        }
    },
    init() {
    },
    helpers() {
        return {
            addFile: this.addFile,
            ignoreFile: this.ignoreFile,
            addDirectory: this.addDirectory,
            ignoreDirectory: this.ignoreDirectory,
            editFile: this.editFile,
            templateFile: this.templateFile,
            templateData: this.templateData,
            chunk: this.chunk
        };
    },
    methods: {
        addFile(glob, parameters) {
            this.asset.addFile(glob, parameters);
        },
        ignoreFile(glob) {
            this.asset.ignoreFile(glob);
        },
        addDirectory(glob, parameters) {
            this.asset.addDirectory(glob, parameters);
        },
        ignoreDirectory(glob) {
            this.asset.ignoreDirectory(glob);
        },
        templateFile(glob, template) {
            this.asset.addFile(glob, { glob: glob, template: template });
        },
        templateData(data, options) {
            if (options)
                this.asset.renderer.options = options;
            return object_1.merge(this.data, data);
        },
        editFile(glob, callback) {
            this.asset.addFile(glob, { glob: '', edit: callback });
        },
        chunk() {
            return this.chunk_stack;
        }
    }
});
