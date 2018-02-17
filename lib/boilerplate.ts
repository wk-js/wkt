import { API } from './api/api';
import { Configure } from './stack/configure';
import { Mixin, MixinClass } from './utils/mixin'
import * as fs from 'fs'
import * as when from 'when'
import { setTimeout } from 'timers';
import { dirname, relative, join, normalize } from 'path';
import { bind, scope } from 'lol/utils/function';
import { unique } from 'lol/utils/array'
import { Resolver } from './resolver/index';
import { requireContent } from './utils/require-content'

interface Contructable<T> {
  new() : T
}

function parse( boilerplate:Boilerplate, content:string, throwOnError:boolean = true ) {
  let code = "var helpers = this;\n"

  const api = boilerplate.api.helpers

  for (const key in api) {
    code += `function ${key}() { return helpers.${key}.apply(null, arguments); }\n`
  }

  code += `function source() {}`
  code += `function api() {}`

  code += `\n${content}`

  try {
    requireContent(code, process.cwd() + '/' + boilerplate.path, api)
  } catch(e) {
    if (throwOnError) throw e
  }
}

function imports(key:string, content:string, path:string) {
  const line_regex = new RegExp(`${key}((.+))`, 'gm')
  const str_regex  = /\(.+\)/g

  const lines   = content.match( line_regex ) || []
  const imports = lines

  .filter((line) => {
    return Array.isArray(line.match(str_regex) as string[])
  })

  .map(line => {
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
  stores: { [key: string]: any } = {}
  stack: Configure = new Configure()
  path: string = ''
  api: any

  parent:Boilerplate | null = null
  children: Boilerplate[] = []

  constructor(public input:string, public output:string) {
    bind(this, 'parse', 'execute', 'bundle')
    this.stack.add( 'bundle', this.bundle )
  }

  get src_path() {
    return normalize(dirname( this.path ))
  }

  get dst_path() {
    return normalize(this.is_root ? this.output : this.root.output)
  }

  get current_task() {
    return this.stack.currentTask ? this.stack.currentTask : 'bundle'
  }

  get root() : Boilerplate {
    return this.parent ? this.parent.root : this
  }

  get is_root() : boolean {
    return this.root === this
  }

  config(key: string, value?: any) : any | undefined {
    if (arguments.length == 2) {
      this.configs[key] = value
      return this.configs[key]
    }

    return this.configs[key]
  }

  store(key: string, value?: any) : any | undefined {
    if (typeof value !== 'undefined') {
      this.stores[key] = value
      return this.stores[key]
    }

    return this.stores[key]
  }

  resolve() {
    return Boilerplate.Resolver.resolve( this.input ).then( this.parse )
  }

  parse(pth:string) : When.Promise<null> {
    this.path = pth

    const scope = this
    const content: string = fs.readFileSync(this.path, 'utf-8')

    return when.reduce([
      function() { return scope.resolveSources( content ) },
      function() { return scope.resolveAPIs( content ) }
    ], (res:null, action:Function) => action(), null)
  }

  resolveAPIs(content:string) {
    const api_imports = imports( 'api', content, this.path )
    api_imports.push( 'boilerplate', 'file' )

    return when.all(api_imports.map(function(path:string) {
      return API.Resolver.resolve(path)
    }))

    .then(() => {
      this.api = API.create( this, unique(api_imports) )
      parse( this, content )
    })
  }

  resolveSources(content:string) {
    const src_imports = imports( 'source', content, this.path )

    return when.all<string[]>(src_imports.map(function(path:string) {
      return Boilerplate.Resolver.resolve(path)
    }))

    .then((paths:string[]) => {
      const boilerplates = paths.map((path:string) => {
        const bp = new Boilerplate( relative(process.cwd(), path), this.output )
        bp.parent = this
        return bp
      })

      this.children = this.children.concat( boilerplates )

      return when.all(boilerplates.map((bp:Boilerplate) => bp.resolve()))
    })
  }

  bundle() {
    return API.bundle( this )
  }

  execute() : When.Promise<boolean> {
    this.stack.before('bundle', 'bundle:children', () => {
      return when.reduce(this.children, (res:any, bp:Boilerplate) => {
        return bp.execute()
      }, null)
      .then(() => true)
    })

    return this.stack.execute({
      beforeTask: () => {
        let print = `[wkt] Execute "${this.stack.currentTask}" from "${this.input}"`
        if (this.is_root) print += ' (root)'
        console.log( print )
      }
    })

    .then(() => {
      console.log(`[wkt] Bundle "${this.input}" done!`)
      return true
    })
  }

}
