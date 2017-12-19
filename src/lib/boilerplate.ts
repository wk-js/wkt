import { API } from './api/index';
import {Configure} from './stack/configure';
import { Mixin, MixinClass } from './utils/mixin'
import * as fs from 'fs'
import {resolve} from './resolver';
import * as when from 'when'
import { setTimeout } from 'timers';
import { dirname } from 'path';
import { bind, scope } from 'lol/utils/function';
import { FileAPI } from './api/file';
import { MacroAPI } from './api/macro';
import { StackAPI } from './api/stack';

API.register( 'file' , FileAPI  )
API.register( 'macro', MacroAPI )
API.register( 'stack', StackAPI )

function parse( boilerplate:Boilerplate, content:string, throwOnError:boolean = true ) {
  let scope = "var helpers = this;\n"

  const api = boilerplate.api.helpers

  for (const key in api) {
    scope += `function ${key}() { return helpers.${key}.apply(null, arguments); }\n`
  }

  scope += "\n" + content

  try {
    Function(scope).call(api)
  } catch(e) {
    if (throwOnError) throw e
  }
}

export class Boilerplate {

  configs: { [key: string]: any } = {}
  stack: Configure = new Configure()
  path: string = ''
  api: {
    apis:    { [key:string]: API }
    helpers: { [key:string]: Function }
  }

  constructor(public file:string, public output:string = '.tmp/generated') {
    bind([ 'parse', 'fetch', 'bundle', 'progress' ], this)

    this.stack.add( 'bundle', this.bundle )

    this.api = API.create( this )

    resolve(file).then((value) => {
      this.parse(value as string)
    })
  }

  get src_path() {
    return dirname( this.path )
  }

  get dst_path() {
    return this.output
  }

  config(key: string, value?: any) : any | undefined {
    if (arguments.length == 2) {
      this.configs[key] = value
      return this.configs[key]
    }

    return this.configs[key]
  }

  parse(pth:string) {
    this.path = pth

    this.stack.execute(this.progress).then(() => {
      console.log('DONE')
    })
  }

  fetch() {
    return when.promise(function(resolve, reject) {
      console.log('waiit...')
      setTimeout(resolve, 2000)
    })
  }

  bundle() {
    const content: string = fs.readFileSync(this.path, 'utf-8');
    parse( this, content )

    API.bundle( this )
  }

  progress(result:any | null) {
    if (result == null) return;


  }

}
