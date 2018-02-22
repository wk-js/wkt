"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("./test");
const asset_pipeline_1 = require("asset-pipeline/js/asset-pipeline");
const chunk_stack_1 = require("../api/file/chunk_stack");
const object_1 = require("lol/utils/object");
const merge_tool_1 = require("asset-pipeline/js/experimental/merge-tool");
const when_1 = require("when");
const path_1 = require("path");
const fs_1 = require("asset-pipeline/js/utils/fs");
exports.FileAPI = test_1.API.create({
    init() {
        const boilerplate = this.boilerplate;
        boilerplate.root.stack.after('bundle', 'render:template', this._copyAndRender);
    },
    bundle() {
        this.asset.load_path = this.boilerplate.src_path;
        this.asset.dst_path = this.boilerplate.dst_path;
        this.asset.save_manifest = false;
        return this.asset.resolve(true);
    },
    helperss() {
        return {
            addFile: this.addFile
        };
    },
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
    helpers: {
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
    },
    methods: {
        _copyAndRender() {
            return this.bundle_copy()
                .then(this.bundle_render);
        },
        /**
         * Copy files
         */
        bundle_copy() {
            return when_1.reduce(this.assets, (reduction, asset) => {
                const ios = Object.keys(asset.manifest.manifest.assets).map((key) => {
                    return [
                        asset.fromLoadPath(key),
                        asset.fromDstPath(asset.getPath(key))
                    ];
                });
                return when_1.all(ios.map((io) => {
                    return fs_1.copy(path_1.relative(process.cwd(), io[0]), path_1.relative(process.cwd(), io[1]));
                }));
            }, null);
        },
        /**
         * Render files and edit them
         */
        bundle_render() {
            const assets = merge_tool_1.MergeTool.fetch_assets.apply(null, this.assets);
            return when_1.reduce(this.assets, (reduction, asset) => {
                const options = asset.renderer.options || {};
                options.imports = object_1.merge(options.imports || {}, asset.data, this.data);
                const imports = options.imports;
                imports.chunk = (key) => {
                    return this.chunk_stack.get(key) || '';
                };
                options.interpolate = options.interpolate || /{%=([\s\S]+?)%}/g;
                options.escape = options.escape || /{%-([\s\S]+?)%}/g;
                options.evaluate = options.evaluate || /{%([\s\S]+?)%}/g;
                asset.renderer.options = options;
                asset.manifest.manifest.assets = assets;
                return asset.renderer.render().then(function () {
                    return asset.renderer.edit();
                });
            }, null);
        }
    }
});
