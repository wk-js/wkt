import { API, APIConstructor } from './api';
import { AssetPipeline, AssetItemRules } from 'asset-pipeline/js/asset-pipeline';
import { ChunkStack } from '../api/file/chunk_stack';
import { merge } from "lol/utils/object";
import { TemplateOptions, Dictionary } from "lodash";
import { MergeTool } from 'asset-pipeline/js/experimental/merge-tool';
import { all, reduce, promise } from "when";
import { dirname, relative } from "path";
import { copy } from "asset-pipeline/js/utils/fs";
import { Boilerplate } from '../boilerplate/boilerplate';

const FileAPI = API.extend('file', {

  init() {
    const boilerplate = (<Boilerplate>this.boilerplate)
    boilerplate.root.stack.after('bundle', 'render:template', this._copyAndRender)
  },

  bundle() : When.Promise<Boolean> {
    this.asset.load_path     = (<Boilerplate>this.boilerplate).src_path
    this.asset.dst_path      = (<Boilerplate>this.boilerplate).dst_path
    this.asset.save_manifest = false

    return this.asset.resolve(true)
  },

  helpers() : { [key:string]: Function } {
    return {
      addFile: this.addFile
    }
  },

  computed: {

    data() : object {
      return this.shared_store('file:data') ?
      this.shared_store('file:data') : 
      this.shared_store('file:data', {})
    },

    assets() : AssetPipeline[] {
      return this.shared_store('file:assets') ?
      this.shared_store('file:assets') : 
      this.shared_store('file:assets', [])
    },

    chunk_stack() : ChunkStack {
      return this.shared_store('file:chunk') ?
      this.shared_store('file:chunk') : 
      this.shared_store('file:chunk', new ChunkStack)
    },

    asset() : AssetPipeline {
      if (this.store('file:current_asset')) {
        return this.store('file:current_asset')
      }

      const asset = new AssetPipeline
      this.store('file:current_asset', asset)
      this.assets.push( asset )

      return asset
    }

  },

  methods: {

    _copyAndRender() {
      return this.bundle_copy()
      .then(this.bundle_render)
    },

    /**
     * Copy files
     */
    bundle_copy() {
      return reduce(this.assets, (reduction:any, asset:AssetPipeline) => {
        const ios = Object.keys(asset.manifest.manifest.assets).map((key) => {
          return [
            asset.fromLoadPath( key ),
            asset.fromDstPath(asset.getPath( key ))
          ]
        })

        return all(ios.map((io) => {
          return copy(
            relative( process.cwd(), io[0] ),
            relative( process.cwd(), io[1] )
          )
        }))
      }, null)
    },

    /**
     * Render files and edit them
     */
    bundle_render() {
      const assets = MergeTool.fetch_assets.apply(null, this.assets)

      return reduce(this.assets, (reduction:any, asset:AssetPipeline) => {
        const options = asset.renderer.options || {}
        options.imports = merge(options.imports || {}, asset.data, this.data)

        const imports = options.imports as Dictionary<any>
        imports.chunk = (key:string) => {
          return this.chunk_stack.get(key) || ''
        }

        options.interpolate = options.interpolate || /{%=([\s\S]+?)%}/g
        options.escape      = options.escape      || /{%-([\s\S]+?)%}/g
        options.evaluate    = options.evaluate    || /{%([\s\S]+?)%}/g

        asset.renderer.options = options
        asset.manifest.manifest.assets = assets

        return asset.renderer.render().then(function() {
          return asset.renderer.edit()
        })
      }, null)
    },

    addFile(glob:string, parameters?:AssetItemRules) {
      this.asset.addFile(glob, parameters)
    },

    ignoreFile(glob:string) {
      this.asset.ignoreFile(glob)
    },

    addDirectory(glob:string, parameters?:AssetItemRules) {
      this.asset.addDirectory(glob, parameters)
    },

    ignoreDirectory(glob:string) {
      this.asset.ignoreDirectory(glob)
    },

    templateFile(glob:string, template?: object | boolean) {
      this.asset.addFile(glob, { glob: glob, template: template })
    },

    templateData(data:object, options?: TemplateOptions) : object {
      if (options) this.asset.renderer.options = options
      return merge(this.data, data)
    },

    editFile(glob:string, callback:(value: Buffer | string) => Buffer | string ) {
      this.asset.addFile(glob, { glob: '', edit: callback })
    },

    chunk() {
      return this.chunk_stack
    }

  }

})