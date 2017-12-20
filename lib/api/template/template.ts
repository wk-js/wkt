import { API } from "..";
import { fetch, readFile, writeFile } from "../file/utils";
import { reduce, all } from 'when'
import { Renderer } from "./renderer";
import { createReadStream, createWriteStream } from "fs";
import { MemoryStream } from "../../utils/memory-stream";
import { ChunkStack } from './chunk_stack'

export class TemplateAPI extends API {

  get globs() : any[] {
    return this.store('globs') ? this.store('globs') : this.store('globs', [])
  }

  chunk_stack:ChunkStack = new ChunkStack

  init() {}

  bundle() {
    return reduce(this.globs, (res:null, glob:any) => {
      const promises = fetch( this.fromDestination(glob.file) ).map((file:string) => {
        return readFile(file)

        .then((content:Buffer) => {
          glob.options.imports = {
            chunk: (key:string) => this.chunk_stack.get(key) || ''
          }
          return Renderer.render( content.toString('utf-8'), glob.options, glob.options.data )
        })

        .then((content:string) => {
          return writeFile(content, file)
        })
      })

      return all(promises)
    }, null)
  }

  helpers() {
    return {
      template: this.template,
      chunkAdd: this.chunkAdd,
      chunkBefore: this.chunkBefore,
      chunkAfter: this.chunkAfter
    }
  }

  template(file:string, options?:any) {
    options = Object.assign({
      data: {}
    }, options || {})

    this.globs.push({ file, options })
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

}