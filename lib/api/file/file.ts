import { API } from "../api";
import { bind } from "lol/utils/function";
import { AssetPipeline, AssetItemRules, AssetItem } from 'asset-pipeline/js/asset-pipeline';
import { MergeTool } from 'asset-pipeline/js/experimental/merge-tool';
import { dirname, relative } from "path";
import { all, reduce } from "when";
import { copy } from "asset-pipeline/js/utils/fs";
import { ask } from "../prompt/utils";
import { merge } from "lol/utils/object";
import { TemplateOptions, Dictionary } from "lodash";
import { ChunkStack } from "./chunk_stack";

export class FileAPI extends API {

  /**
   * Data shared between all bunldes
   */
  get data() : object {
    return this.shared_store('template:data') ?
    this.shared_store('template:data') : 
    this.shared_store('template:data', {})
  }

  /**
   * Get an array of every asset-pipeline generated by bundles
   */
  get assets() {
    if (!this.shared_store('assets')) {
      return this.shared_store('assets', [])
    }

    return this.shared_store('assets')
  }

  /**
   * Chunk shared between all bunldes
   */
  get chunk_stack() {
    if (!this.shared_store('assets:chunk_stack')) {
      return this.shared_store('assets:chunk_stack', new ChunkStack)
    }

    return this.shared_store('assets:chunk_stack')
  }

  /**
   * Get the asset pipeline of the active bundle
   */
  get asset() {
    if (this.store('file:asset')) {
      return this.store('file:asset')
    }

    const asset = new AssetPipeline
    this.store('file:asset', asset)
    this.assets.push( asset )

    return asset
  }

  init() {
    bind(this, '_copyAndRender', 'bundle_copy', 'bundle_render')
    this.boilerplate.root.stack.after('bundle', 'render:template', this._copyAndRender)
  }

  bundle() {
    this.asset.load_path     = this.boilerplate.src_path
    this.asset.dst_path      = this.boilerplate.dst_path
    this.asset.save_manifest = false

    return this.asset.resolve(true)
  }

  private _copyAndRender() {
    return this.bundle_copy()
    .then(this.bundle_render)
  }

  /**
   * Copy files
   */
  private bundle_copy() {
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
  }

  /**
   * Render files and edit them
   */
  private bundle_render() {
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
  }

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
    }
  }

  addFile(glob:string, parameters?:AssetItemRules) {
    this.asset.addFile(glob, parameters)
  }

  ignoreFile(glob:string) {
    this.asset.ignoreFile(glob)
  }

  addDirectory(glob:string, parameters?:AssetItemRules) {
    this.asset.addDirectory(glob, parameters)
  }

  ignoreDirectory(glob:string) {
    this.asset.ignoreDirectory(glob)
  }

  templateFile(glob:string, template?: object | boolean) {
    this.asset.addFile(glob, { glob: glob, template: template })
  }

  templateData(data:object, options?: TemplateOptions) : object {
    if (options) this.asset.renderer.options = options
    return merge(this.data, data)
  }

  editFile(glob:string, callback:(value: Buffer | string) => Buffer | string ) {
    this.asset.addFile(glob, { glob: '', edit: callback })
  }

  chunk() {
    return this.chunk_stack
  }

}