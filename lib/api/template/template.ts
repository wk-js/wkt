import { API } from "..";
import { fetch, readFile, writeFile } from "../file/utils";
import { reduce, all } from 'when'
import { Renderer } from "./renderer";
import { createReadStream, createWriteStream } from "fs";
import { MemoryStream } from "../../utils/memory-stream";

export class TemplateAPI extends API {

  get globs() : any[] {
    return this.store('globs') ? this.store('globs') : this.store('globs', [])
  }

  // get chunks() : any {
  //   return this.store('chunks') ? this.store('chunks') : this.store('chunks', {})
  // }

  chunks:any = {}

  init() {}

  bundle() {
    return reduce(this.globs, (res:null, glob:any) => {
      const promises = fetch( this.fromDestination(glob.file) ).map((file:string) => {
        return readFile(file)

        .then((content:Buffer) => {
          glob.options.imports = {
            chunk: (key:string) => this.chunks[key] || ''
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
      chunk: this.chunk
    }
  }

  template(file:string, options?:any) {
    options = Object.assign({
      data: {}
    }, options || {})

    this.globs.push({ file, options })
  }

  chunk(key:string, value:any) {
    this.chunks[key] = value
  }

}