import { API } from './api/index';
import { Configure } from './stack/configure';
import { Mixin, MixinClass } from './utils/mixin'
import * as fs from 'fs'
import * as when from 'when'
import { setTimeout } from 'timers';
import { dirname, relative, join, normalize } from 'path';
import { bind, scope } from 'lol/utils/function';
import { Resolver } from './resolver/index';

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

function imports(key:string, content:string, path:string) {
  const line_regex = new RegExp(`//${key}((.+))`, 'gm')
  const str_regex  = /\(.+\)/g

  const lines   = content.match( line_regex ) || []
  const imports = lines.map(line => {
    let result = (line.match(str_regex) as string[])[0]
    result = result.trim().replace(/"|'|`|\(|\)/g, '').trim()

    let pth = join( dirname(path), result )
    pth = join( process.cwd(), pth )

    try {
      fs.statSync( pth )
      return pth
    } catch(e) {
      // console.log( e )
    }

    return result
  })

  return Array.prototype.concat.apply([], imports)
}

function resolver(path:string) {
  return path
}

const BoilerplateResolver = new Resolver<string>((path:string) => path)

export class Boilerplate {

  static Resolver = BoilerplateResolver

  configs: { [key: string]: any } = {}
  stack: Configure = new Configure()
  path: string = ''
  api: {
    apis:    { [key:string]: API }
    helpers: { [key:string]: Function }
  }

  constructor(public input:string, public output:string = '.tmp/generated') {
    bind([ 'parse', 'execute' ], this)

    this.stack.add( 'bundle' )
  }

  get src_path() {
    return dirname( this.path )
  }

  get dst_path() {
    return this.output
  }

  get currentBundle() {
    return this.stack.currentTask ? this.stack.currentTask : 'bundle'
  }

  config(key: string, value?: any) : any | undefined {
    if (arguments.length == 2) {
      this.configs[key] = value
      return this.configs[key]
    }

    return this.configs[key]
  }

  resolve() {
    return Boilerplate.Resolver.resolve( this.input ).then( this.parse )
  }

  parse(pth:string) {
    this.path = pth

    const content: string = fs.readFileSync(this.path, 'utf-8')

    const api_imports = imports( 'api'   , content, this.path )
    const src_imports = imports( 'source', content, this.path )

    return API.resolve( api_imports ).then((a) => {
      this.api = API.create( this, api_imports )
      parse( this, content )
    })
  }

  execute() {
    return this.stack.execute({
      afterTask: () => API.bundle( this )
    }).then(() => {
      console.log('DONE')
    })
  }

}
