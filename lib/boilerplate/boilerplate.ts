import { API } from '../api/api';
import { Configure } from '../stack/configure';
import { Mixin, MixinClass } from '../utils/mixin'
import * as fs from 'fs'
import when from 'when'
import { setTimeout } from 'timers';
import { dirname, relative, join, normalize, basename, extname, isAbsolute } from 'path';
import { bind, scope } from 'lol/utils/function';
import { unique } from 'lol/utils/array'
import { Resolver } from '../resolver/index';
import { requireContent } from '../utils/require-content';
import { Print } from 'wk-print/js/print';
import { TagExtension } from 'wk-print/js/extensions/tag';
import { DebugCategory } from 'wk-print/js/categories/debug';
import { isFile } from 'asset-pipeline/js/utils/fs';
import { ask } from '../api/prompt/utils';
import { P } from '../print';
import { parse, get_imports, fetch_optionals } from './utils'
import fm from 'front-matter';

const BoilerplateResolver = new Resolver<string>((path:string) => path)

export class Boilerplate {

  static Resolver = BoilerplateResolver

  configs: { [key: string]: any } = {}
  stores: { [key: string]: any } = {}
  stack: Configure = new Configure()
  path: string = ''
  api: any

  name: string = 'no-name'

  parent:Boilerplate | null = null
  children: Boilerplate[] = []

  constructor( private _output:string ) {
    bind(this, 'parse', 'execute', 'bundle')
    this.stack.add( 'bundle', this.bundle )
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
    return this.root._output = output
  }

  store(key: string, value?: any) : any | undefined {
    if (typeof value !== 'undefined') {
      this.stores[key] = value
      return this.stores[key]
    }

    return this.stores[key]
  }

  bundle() {
    P.debug( 'Bundles APIs', P.green(Object.keys(this.api.apis).join('|')) )
    return API.bundle( this )
  }

  resolve( input:string, relativeTo:string = process.cwd() ) {
    return Boilerplate.Resolver.resolve( input, relativeTo ).then( this.parse )
  }

  parse(pth:string) : When.Promise<null> {
    if (!isFile(pth)) {
      pth = join(pth, 'template.js')
      if (!isFile(pth)) return when.resolve(null)
    }

    this.path = pth

    const scope = this
    const content: string = fs.readFileSync(this.path, 'utf-8')

    const result:any = fm( content )

    const attrs = Object.assign({
      name: extname(pth).length > 0 ? basename(dirname(pth)) : basename(pth),
      sources: [],
      optionalSources: [],
      apis: [],
      optionalApis: []
    }, result.attributes)

    this.name = attrs.name

    return fetch_optionals(attrs.sources, attrs.optionalSources)

    .then(() => fetch_optionals(attrs.apis, attrs.optionalApis))

    .then(() => {
      return when.reduce([
        function() { return scope.resolveSources( attrs.sources ) },
        function() { return scope.resolveAPIs( attrs.apis, result.body ) }
      ], (res:null, action:Function) => action(), null)
    })
  }

  resolveAPIs(apis:string[], content:string) {
    return when.all<new (...args: any[]) => API>(apis.map((path:string) => {
      return API.Resolver.resolve(path, this.path)
    }))

    .then(() => {
      apis = apis.concat( this.getUsedAPIs() )
      this.api = API.create( this, unique(apis) )
      parse( this, content )
    })
  }

  resolveSources( sources:string[] ) {
    return when.all<string[]>(sources.map((path:string) => {
      const bp = new Boilerplate( this._output )
      bp.parent = this
      this.children.push( bp )
      return bp.resolve( path, this.path )
    }))
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
    if (this.children.length > 0) {
      this.stack.before('bundle', 'bundle:children', () => {
        return when.reduce(this.children, (res:any, bp:Boilerplate) => bp.execute(), null)
      })
    }

    return this.stack.execute({
      beforeTask: () => {
        let print = `Execute ${P.green(this.stack.currentTask as string)} from ${P.magenta(this.name)}`
        if (this.is_root) print += P.yellow(' (root)')
        P.debug( print )
      }
    })

    .then(() => {
      if (this.is_root) P.debug(`Bundle done!`)
      return true
    })
  }

}
