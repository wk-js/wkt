import { statSync } from "fs"
import { Iterator } from '../utils/iterator'
import npa2 from 'realize-package-specifier'
import * as git from '../utils/git'
import * as when from 'when'
import { toSlug } from 'lol/utils/string'
import { bind } from 'lol/utils/function'
import { isFile } from "asset-pipeline/js/utils/fs";
import { dirname, join } from "path";

function NOOP() {}

function checkPath( str:string ) {
  try {
    statSync( str )
  } catch(e) {
    // console.log(`"${str}" does not exist.`)
    return false
  }

  return true
}

export class Resolver<T> {

  sources: { [key:string]: T } = {}

  constructor(private resolver:Function) {
    bind(this, 'get', 'register', 'resolve', 'resolveId', 'resolvePath', 'resolveRepository')
  }

  resolve(pathOrIdOrRepo:string, relativeTo:string) {
    const iterator = new ResolveIterator<T>([
      this.resolveId,
      this.resolvePath,
      this.resolveRepository
    ], pathOrIdOrRepo, relativeTo)

    return iterator.start()

    .then((item:T) => {
      this.register( pathOrIdOrRepo, item )
      return item
    })
  }

  get( id:string ) : T | null {
    return this.sources[id]
  }

  register( id:string, item:T ) {
    this.sources[ id ] = item
  }

  private resolveId( iterator:ResolveIterator<T> ) {
    const path = this.get( iterator.pathOrIdOrRepo )
    path ? iterator.resolve( path ) : iterator.next()
  }

  private resolvePath( iterator:ResolveIterator<T> ) {
    const resolve_paths = [ process.cwd() ]

    if (isFile(iterator.relativeToPath)) {
      resolve_paths.push( dirname(iterator.relativeToPath) )
    }

    let result

    for (let i = 0, ilen = resolve_paths.length; i < ilen; i++) {
      result = join( resolve_paths[i], iterator.pathOrIdOrRepo )
      if (checkPath(result)) {
        iterator.resolve( this.resolver(result) )
        break;
      }
    }

    iterator.next()
  }

  private resolveRepository( iterator:ResolveIterator<T> ) {

    npa2( iterator.pathOrIdOrRepo, (err:any, res:any) => {
      if (err) {
        console.log(err)
        iterator.next()
        return
      }

      let path:string | null = null

      if (res.type.match(/^(local|directory)$/)) {
        this.resolvePath( iterator )
      }

      else if (res.type === 'hosted') {
        const hash            = toSlug( iterator.pathOrIdOrRepo )
        const repo            = res.hosted.ssh.split('#')
        const repo_url        = repo[0]
        const repo_committish = repo[1]

        path = `${process.cwd()}/.wkt-tmp/${hash}`

        let promise = when.resolve()

        if (!checkPath( path )) {
          promise = promise.then(() => {
            return git.clone( repo_url, path as string )
          })
        }

        if (repo_committish) {
          promise = promise.then(() => {
            return git.checkout( repo_committish, path as string )
          })
        }

        promise.then(() => iterator.resolve( this.resolver(path) ))
      }
    })

  }

}

class ResolveIterator<T> implements Iterator<Function> {

  private pointer = -1
  public resolved = false

  constructor(
    private functions:Function[],
    public pathOrIdOrRepo:string,
    public relativeToPath:string,
    public resolve:Function = NOOP,
    public reject:Function = NOOP
  ) {}

  next() {
    this.pointer++

    if (this.pointer < this.functions.length && !this.resolved) {
      return {
        done: false,
        value: this.functions[this.pointer]( this )
      }
    }

    if (!this.resolved) {
      this.reject(new Error(`Cannot resolve "${this.pathOrIdOrRepo}"`))
    }

    return {
      done: true,
      value: null
    }
  }

  start() {
    return when.promise<T>((resolve:Function, reject:Function) => {
      this.resolve = (item:T) => {
        this.resolved = true
        resolve(item)
      }

      this.reject = (e:Error) => {
        this.resolved = true
        reject(e)
      }

      this.next()
    })
  }

}