import { fetch, ensureDir, copy, remove, move, editFile } from "./utils";
import { join } from "path";
import { all, reduce, promise } from "when";
import { bind } from "lol/utils/function";
import { API } from "../index";
import { Boilerplate } from "../../boilerplate";
import { Mixin, MixinClass, MixinConstructor } from "../../utils/mixin";

export interface FileAPIItem {
  file:string,
  action:string,
  context:string,
  output?:string,
  callback?:Function
}

export class FileAPI extends API {

  get globs() : FileAPIItem[] {
    return this.store('globs') ? this.store('globs') : this.store('globs', [])
  }

  init() {
    bind(['bundle_copy', 'bundle_apply'], this)
    this.copy( '**/*' )
  }

  bundle() {
    return this.bundle_copy().then(this.bundle_apply)
  }

  helpers() {
    return {
      file:   this.file,
      copy:   this.copy,
      remove: this.remove,
      rename: this.rename,
      move:   this.move,
      ignore: this.ignore,
      edit:   this.edit
    }
  }

  file(file:string, parameters:FileAPIItem) {
    // Defaults
    parameters = Object.assign({
      file:   file,
      action: 'copy',
      context: 'source'
    }, parameters || {})

    this.globs.push( parameters )
  }

  copy(file:string, output?:string) {
    if (output) {
      this.globs.push({ file: file, action: 'copy', context: 'destination', output: output })
      return
    }

    this.globs.push({ file: file, action: 'copy', context: 'source' })
  }

  remove(file:string) {
    this.globs.push({ file: file, action: 'remove', context: 'destination' })
  }

  move(file:string, output:string) {
    this.globs.push({ file: file, action: 'move', context: 'destination', output: output })
  }

  rename(file:string, output:string) {
    this.move( file, output )
  }

  ignore(file:string) {
    this.remove( file )
  }

  edit(file:string, callback:Function) {
    this.globs.push({ file: file, action: 'edit', context: 'destination', callback: callback })
  }

  bundle_copy() {
    const globs = this.globs.filter(glob => glob.context === 'source')
                            .map(glob => this.fromSource(glob.file))

    const in_out = fetch( globs ).map(( file ) => {
      return [ file, this.toDestination( file ) ]
    })

    return all(in_out.map(function(io) {
      return copy( io[0], io[1] )
    }))
  }

  bundle_apply() {
    return this.globs
      .filter((glob) => glob.context === 'destination')
      .map((glob) => {
        const files = fetch( this.fromDestination(glob.file) )
        .map((file) => {
          return () => {
            if (glob.output && glob.action === 'copy'  ) {
              return copy( file, this.fromDestination(glob.output) )
            } else if (glob.output && glob.action === 'move' ) {
              return move( file, this.fromDestination(glob.output) )
            } else if (glob.action === 'remove') {
              return remove( file )
            } else if (glob.action === 'edit' && typeof glob.callback === 'function') {
              return editFile( file, glob.callback )
            }
          }
        })

        return reduce(files, (r:null, fn:Function) => fn(), null)
      })
  }

}