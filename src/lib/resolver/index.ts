import { statSync } from "fs"
import { Iterator } from '../utils/iterator'
import * as npa2 from 'realize-package-specifier'
import * as git from '../utils/git'
import * as when from 'when'
import { toSlug } from 'lol/utils/string'
import { bind } from 'lol/utils/function'

function checkPath( str:string ) {
  try {
    statSync( str )
  } catch(e) {
    console.log(`"${str}" does not exist.`)
    return false
  }

  return true
}

export class Resolver<T> {

  sources: { [key:string]: T } = {}

  constructor(public resolver:Function) {
    bind([ 'get', 'register', 'resolve', 'resolveId', 'resolvePath', 'resolveRepository' ], this)
  }

  resolve(pathOrIdOrRepo:string) {
    return when.promise((resolve, reject) => {
      const iterator = new ResolveIterator([
        this.resolveId,
        this.resolvePath,
        this.resolveRepository
      ], pathOrIdOrRepo, resolve, reject)

      iterator.next()
    })
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

  private resolveId( iterator:ResolveIterator ) {
    const path = this.get( iterator.pathOrIdOrRepo )
    path ? iterator.complete( path ) : iterator.next()
  }

  private resolvePath( iterator:ResolveIterator ) {
    checkPath(iterator.pathOrIdOrRepo) ?
    iterator.complete( this.resolver(iterator.pathOrIdOrRepo) ) :
    iterator.next()
  }

  private resolveRepository( iterator:ResolveIterator ) {

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

        path = `${process.cwd()}/.tmp/${hash}`

        let promise = when()

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

        promise.then(() => iterator.complete( this.resolver(path) ))
      }
    })

  }

}

class ResolveIterator implements Iterator<Function> {

  private pointer = -1
  public resolved = false

  constructor(
    private functions:Function[],
    public pathOrIdOrRepo:string,
    public complete:Function,
    public fail:Function
  ) {}

  next() {
    this.pointer++

    if (this.pointer < this.functions.length && !this.resolved) {
      return {
        done: false,
        value: this.functions[this.pointer]( this )
      }
    }

    this.fail()

    return {
      done: true,
      value: null
    }
  }

}