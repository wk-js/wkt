import { API, CombinedAPIInstance } from '../api2';
import { ChunkStack } from './chunk_stack';
import { AssetPipeline, AssetItemRules, AssetItem } from 'asset-pipeline/js/asset-pipeline';
import { TemplateOptions, Dictionary } from "lodash";
import { merge } from "lol/utils/object";

export const FileAPI = API.create({

  data() {
    return { id: 'id' }
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

  init() {

  },

  helpers() {
    return {
      addFile:         this.addFile,
      ignoreFile:      this.ignoreFile,
      addDirectory:    this.addDirectory,
      ignoreDirectory: this.ignoreDirectory,
      editFile:        this.editFile,
      templateFile:    this.templateFile,
      templateData:    this.templateData,
      chunk:           this.chunk
    }
  },

  methods: {

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