'use strict'

const Chunk = require('./chunk')
const { FileList } = require('filelist')

const { join, resolve, basename }
= require('path')

const { readdirSync, readFileSync, accessSync, statSync }
= require('fs')

const { spawnSync }
= require('child_process')

const { toSlug }
= require('lol/utils/string')

function NOOP() {}

class Boilerplate {

  constructor( options ) {
    const bound = [ '_configure', 'chunk', 'file', 'add', 'before', 'after' ]
    bound.forEach((k) => this[k] = this[k].bind(this))

    this.ignored_files = [ '.DS_Store', '.git', 'node_modules', 'npm-debug.*' ]

    this.name = 'no_name'
    this.path = 'no_path'

    this.configure = NOOP

    this.manager = null

    Object.assign(this, options || {})
  }

  chunk() {
    return this.manager.chunk.apply(this.manager, arguments)
  }

  file() {
    return this.manager.file.apply(this.manager, arguments)
  }

  add() {
    return this.manager.add.apply(this.manager, arguments)
  }

  before(key, fn) {
    return this.manager.before(this.name, key, fn)
  }

  after(key, fn) {
    return this.manager.after(this.name, key, fn)
  }

  _configure() {
    const FL = new FileList
    FL.include( join(this.path, 'content/**/*') )
    this.ignored_files.forEach(ignore => FL.exclude(ignore))

    FL.forEach((file) => {
      const stat = statSync(file)
      if (!stat.isFile()) return

      const key = file.replace(new RegExp(`${this.path}/content/`), '')
      // this.files[key] = readFileSync( file, 'utf-8' )
      this.manager.file(key, readFileSync( file, 'utf-8' ))
    })

    this.configure()
  }
}

Boilerplate.create = function( pathOrRepo ) {
  const path = Boilerplate.resolve( pathOrRepo )
  const template = {}

  try {
    template.name = basename(path)
    template.path = path
    Object.assign(template, require( path ) || {})
  } catch(e) {
    return null
  }

  const boilerplate = new Boilerplate(template)

  return boilerplate
}

Boilerplate.resolve = function( pathOrRepo ) {

  let path

  // Is a boilerplate path
  if (!path) {
    try {
      path = resolve(  pathOrRepo  )
      accessSync( path )
    } catch(e) {
      path = undefined
    }
  }

  // Is a git repository
  if (!path) {
    const hash = toSlug(  pathOrRepo  )
    path = `${process.cwd()}/tmp/${hash}`

    try {
      accessSync(path)
      return path
    } catch(e) {
      console.log(`Git clone ${ pathOrRepo }`)
    }

    const repo     =  pathOrRepo .split('#')
    const repo_url = repo[0]
    const commit   = repo[1]
    let res

    res = spawnSync('git', [ `clone ${repo_url} tmp/${hash}` ], { shell: true, encoding: 'utf-8' })

    if (!res.error && res.status != 0 && commit) {
      res = spawnSync('git', [ `checkout ${commit}` ], { shell: true, encoding: 'utf-8', cwd: `tmp/${hash}` })
    }

    if (res.error || res.status != 0) {
      path = undefined
      console.log(new Error(`An error occured`))
      console.log(res)
    }
  }

  return path
}

module.exports = Boilerplate