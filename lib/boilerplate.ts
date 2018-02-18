import { API } from './api/api';
import { Configure } from './stack/configure';
import { Mixin, MixinClass } from './utils/mixin'
import * as fs from 'fs'
import when from 'when'
import { setTimeout } from 'timers';
import { dirname, relative, join, normalize, basename, isAbsolute } from 'path';
import { bind, scope } from 'lol/utils/function';
import { unique } from 'lol/utils/array'
import { Resolver } from './resolver/index';
import { requireContent } from './utils/require-content';
import { Print } from 'wk-print/js/print';
import { TagExtension } from 'wk-print/js/extensions/tag';
import { DebugCategory } from 'wk-print/js/categories/debug';
import { isFile } from 'asset-pipeline/js/utils/fs';
import { ask } from './api/prompt/utils';

function parse( boilerplate:Boilerplate, content:string, throwOnError:boolean = true ) {
  let code = "var helpers = this;\n"

  const api = boilerplate.api.helpers

  for (const key in api) {
    code += `function ${key}() { return helpers.${key}.apply(null, arguments); }\n`
  }

  code += `\n${content}`

  try {
    requireContent(code, process.cwd() + '/' + boilerplate.path, api)
  } catch(e) {
    if (throwOnError) throw e
  }
}

function imports(key:string, content:string, path:string) {
  const line_regex = new RegExp(`\/\/@${key}(\\?)?=.+`, 'g')
  const str_regex  = new RegExp(`\/\/@${key}(\\?)?=`, 'g')
  const optional_regex = new RegExp(`\/\/@${key}\\?=`, 'g')

  const lines = content.match( line_regex ) || []

  return when.reduce<string[]>(lines, (reducer:string[], line:string) => {
    const result = line.replace(str_regex, '').trim()

    if (line.match(optional_regex)) {
      return ask(`Use ${basename(dirname(line))} ${key}?`).then(function(confirm) {
        if (confirm) reducer.push( result )
        return reducer
      })
    }

    reducer.push( result )
    return reducer
  }, [])

  .then(function(lines:string[]) {
    return lines.filter((line:string) => !line ? false : (line.length > 0))
  })

  // .then(function(lines:string[]) {
  //   return lines.map(function(line:string) {



  //     // console.log( line )

  //     // let pth = join( dirname(path), line )

  //     // if (!isAbsolute( pth )) {
  //     //   pth = join( process.cwd(), pth )
  //     // }

  //     // try {
  //     //   fs.statSync( pth )
  //     //   return pth
  //     // } catch(e) {
  //     //   throw new Error(`Cannot find ${pth}`)
  //     // }


  //   })
  // })
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

  print: any = new Print

  constructor(private _input:string, private _output:string) {
    bind(this, 'parse', 'execute', 'bundle')
    this.stack.add( 'bundle', this.bundle )

    this.print.config.category({
      name: 'debug',
      visible: true,
      extensions: {
        style: { styles: ['grey'] },
        tag: { tag: 'wkt', styles: ['cyan'] }
      }
    })
    this.print.config.extension(TagExtension)
  }

  get src_path() {
    return normalize(relative(process.cwd(), dirname( this.path )))
  }

  get dst_path() {
    return normalize(this.is_root ? this._output : this.root._output)
  }

  get absolute_src_path() {
    return normalize(dirname( this.path ))
  }

  get absolute_dst_path() {
    const output = normalize(this.is_root ? this._output : this.root._output)
    if (isAbsolute(output)) return output
    return join( process.cwd(), output )
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

  setOutput(output:string) {
    return this._output = output
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
    return Boilerplate.Resolver.resolve( this._input, process.cwd() ).then( this.parse )
  }

  parse(pth:string) : When.Promise<null> {
    if (!isFile(pth)) {
      pth = join(pth, 'template.js')
      if (!isFile(pth)) return when.resolve(null)
    }

    this.path = pth

    const scope = this
    const content: string = fs.readFileSync(this.path, 'utf-8')

    return when.reduce([
      function() { return scope.resolveSources( content ) },
      function() { return scope.resolveAPIs( content ) }
    ], (res:null, action:Function) => action(), null)
  }

  resolveAPIs(content:string) {
    return imports( 'api', content, this.path ).then((imports) => {
      imports.push( 'boilerplate', 'file' )
      return imports
    })

    .then((imports) => {
      return when.all<new (...args: any[]) => API>(imports.map((path:string) => {
        return API.Resolver.resolve(path, this.path)
      }))

      .then(() => imports)
    })

    .then((imports) => {
      imports = imports.concat( this.getUsedAPIs() )
      this.api = API.create( this, unique(imports) )
      parse( this, content )
    })
  }

  resolveSources(content:string) {
    return imports( 'source', content, this.path )

    .then((imports) => {
      return when.all<string[]>(imports.map((path:string) => {
        return Boilerplate.Resolver.resolve(path, this.path)
      }))
    })

    .then((paths:string[]) => {
      const boilerplates = paths.map((path:string) => {
        const bp = new Boilerplate( relative(process.cwd(), path), this._output )
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

  getUsedAPIs() {
    let apis:string[] = []

    for (let i = 0, ilen = this.children.length; i < ilen; i++) {
      apis = apis.concat( apis, this.children[i].getUsedAPIs() )
    }

    if (this.api) {
      apis = apis.concat( Object.keys(this.api.apis) )
    }

    return unique( apis )
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
        let print = `Execute ${this.print.green(this.stack.currentTask as string)} from ${this.print.magenta(this._input)}`
        if (this.is_root) print += this.print.yellow(' (root)')
        this.print.debug( print )
      }
    })

    .then(() => {
      this.print.debug(`Bundle ${this.print.magenta(this._input)} done!`)
      return true
    })
  }

}
