import { API } from "..";
import { fetch, readFile, writeFile } from "../file/utils";
import { reduce, all } from 'when'
import { Renderer } from "./renderer";
import { createReadStream, createWriteStream } from "fs";
import { MemoryStream } from "../../utils/memory-stream";
import { ChunkStack } from './chunk_stack'
import { Boilerplate } from "../..";
import { merge } from 'lol/utils/object'
import { js_beautify } from 'js-beautify'

const _DATA:any = {}

export class TemplateSingleton extends API {

  chunk_stack:ChunkStack = new ChunkStack
  data:any = {}

  constructor(boilerplate:Boilerplate) {
    super( boilerplate.root )
    TemplateSingleton.templates[boilerplate.root.input] = this
  }

  get globs() : any {
    return this.store('globs') ? this.store('globs') : this.store('globs', {})
  }

  store(key:string, value?:any) : any {
    this.stores[this.boilerplate.root.input] = this.stores[this.boilerplate.root.input] || {}

    if (arguments.length === 2) {
      this.stores[this.boilerplate.root.input][key] = value
      return this.stores[this.boilerplate.root.input][key]
    }

    return this.stores[this.boilerplate.root.input][key]
  }

  init() {
    this.afterRootBundle = this.afterRootBundle.bind(this)
    this.boilerplate.root.stack.after('bundle', this.afterRootBundle)
  }

  bundle() {}

  helpers() {
    return {
      template: this.template,
      templateData: this.templateData,
      chunkAdd: this.chunkAdd,
      chunkBefore: this.chunkBefore,
      chunkAfter: this.chunkAfter
    }
  }

  afterRootBundle() {
    return reduce(Object.keys(this.globs), (res:null, glob_key:string) => {
      const options  = this.globs[glob_key]
      const promises = fetch( this.fromDestination(glob_key) ).map((file:string) => {
        return readFile(file)

        .then((content:Buffer) => {
          options.imports = {
            chunk: (key:string) => this.chunk_stack.get(key) || ''
          }
          options.data = merge({}, this.data, options.data)
          return Renderer.render( content.toString('utf-8'), options, options.data )
        })

        .then((content:string) => {
          if (file.match(/\.js$/)) {
            return js_beautify(content, {
              indent_size: 2,
              max_preserve_newlines: 2
            })
          }

          return content
        })

        .then((content:string) => {
          return writeFile(content, file)
        })
      })

      return all(promises)
    }, null)
  }

  template(file:string, options?:any) {
    options = Object.assign({
      data: {},
      imports: {}
    }, options || {})

    const glob = this.globs[file] || { data: {}, imports: {} }
    merge(glob, options)
    this.globs[file] = glob
  }

  templateData(data:any) {
    Object.assign(this.data, data)
  }

  chunkAdd(key:string, chunk:string) {
    this.chunk_stack.add( key, chunk )
  }

  chunkBefore(bfore:string, key:string, chunk:string) {
    this.chunk_stack.before( bfore, key, chunk )
  }

  chunkAfter(after:string, key:string, chunk:string) {
    this.chunk_stack.after( after, key, chunk )
  }

  static templates : { [key:string]: TemplateSingleton } = {}

}

export class TemplateAPI extends API {

  get singleton() {
    if (!TemplateSingleton.templates[this.boilerplate.root.input]) {
      return new TemplateSingleton(this.boilerplate)
    }
    return TemplateSingleton.templates[this.boilerplate.root.input]
  }

  init() {
    const singleton = this.singleton
  }

  bundle() {}

  helpers() {
    const helpers  : { [key:string]: Function } = {}
    const shelpers : { [key:string]: Function } = this.singleton.helpers()
    const scope    = this.singleton

    for (const key in shelpers) {
      helpers[ key ] = function() {
        return shelpers[ key ].apply( scope, arguments )
      }
    }

    return helpers
  }

}