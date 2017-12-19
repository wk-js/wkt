import {Iterator} from './utils/iterator';
import * as fs from 'fs'
import npa2 from 'realize-package-specifier'
import * as git from './utils/git'
import * as when from 'when'
import { toSlug } from 'lol/utils/string'

export interface ResolverSources {
  [key:string]: string[]
}

const Sources: ResolverSources = {}

function checkPath( str:string ) {
  try {
    fs.statSync( str )
  } catch(e) {
    console.log(`"${str}" does not exist.`)
    return false
  }

  return true
}

function resolveId( iterator:ResolveIterator ) {
  const path = getPath( iterator.pathOrIdOrRepo )
  path ? iterator.complete( path ) : iterator.next()
}

function resolvePath( iterator:ResolveIterator ) {
  checkPath(iterator.pathOrIdOrRepo) ?
  iterator.complete( iterator.pathOrIdOrRepo ) :
  iterator.next()
}

function resolveRepository( iterator:ResolveIterator ) {

  npa2( iterator.pathOrIdOrRepo, function(err:any, res:any) {
    if (err) {
      console.log(err)
      iterator.next()
      return
    }

    let path:string | null = null

    if (res.type.match(/^(local|directory)$/)) {
      resolvePath( iterator )
    }

    else if (res.type === 'hosted') {
      const hash            = toSlug( iterator.pathOrIdOrRepo )
      const repo            = res.hosted.ssh.split('#')
      const repo_url        = repo[0]
      const repo_committish = repo[1]

      path = `${process.cwd()}/.tmp/${hash}`

      let promise = when({})

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

      promise.then(() => register( path as string, iterator.pathOrIdOrRepo ))

      promise.then(() => iterator.complete( path ))
    }
  })

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

export function getPath( id:string ) {
  if (Sources.hasOwnProperty(id)) return id

  for (const path in Sources) {
    if (Sources[path].indexOf( path ) > -1) return path
  }

  return null
}

export function register( path:string, id:string ) {
  Sources[ path ] = Sources[path] || []
  if (Sources[path].indexOf( id ) === -1) Sources[path].push( id )
}

export function resolve( pathOrIdOrRepo:string ) {
  return when.promise(function(resolve, reject) {
    const iterator = new ResolveIterator([
      resolveId,
      resolvePath,
      resolveRepository
    ], pathOrIdOrRepo, resolve, reject)

    iterator.next()
  })
}