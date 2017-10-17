'use strict'

const { FileList }  = require('filelist')
const path          = require('path')
const when          = require('when')
const fs            = require('fs')
const { spawnSync } = require('child_process')
const { toSlug }    = require('lol/utils/string')
const npa           = require('npm-package-arg')
const npa2          = require('realize-package-specifier')

function NOOP() {}

class Boilerplate {

  constructor( options ) {
    const bound = [ '_configure', 'file', 'add', 'before', 'after' ]
    bound.forEach((k) => this[k] = this[k].bind(this))

    this.ignored_files = [ '.DS_Store', '.git', 'node_modules', 'npm-debug.*' ]

    this.name = 'no_name'
    this.path = 'no_path'

    this.configure = NOOP

    this.manager = null

    Object.assign(this, options || {})
  }

  get chunks() {
    return this.manager.chunks
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

  clean() {

  }

  _configure() {
    const FL = new FileList
    FL.include( path.join(this.path, 'content/**/*') )
    this.ignored_files.forEach(ignore => FL.exclude(ignore))

    FL.forEach((file) => {
      const stat = fs.statSync(file)
      if (!stat.isFile()) return

      const key = file.replace(new RegExp(`${this.path}/content/`), '')
      this.manager.file(key, fs.readFileSync( file, 'utf-8' ))
    })

    this.configure()
  }
}

Boilerplate.create = function( pathOrRepo ) {
  return Boilerplate.resolve( pathOrRepo ).then((pth) => {
    const template = {}

    try {
      template.name = path.basename(pth)
      template.path = pth
      Object.assign(template, require( pth ) || {})
    } catch(e) {
      return null
    }

    const boilerplate = new Boilerplate(template)

    return boilerplate
  })
}

Boilerplate.resolve = function( pathOrRepo ) {

  //  Is a directory path
  const promise = when.promise(function(resolve) {
    fs.stat( path.resolve(pathOrRepo), function(err) {
      setTimeout(() => {
        if (err) return resolve(null)
        resolve( path.resolve(pathOrRepo) )
      }, 1000)
    })
  })

  // Is a git repository
  .then((pth) => {
    if (pth) return pth

    return when.promise(function(resolve, reject) {
      const res = npa.resolve('lol', pathOrRepo)

      npa2(pathOrRepo, function(error, result) {
        if (error) {
          return reject(error)
        }

        const hash = toSlug( pathOrRepo )
        pth = `${process.cwd()}/tmp/${hash}`
        const repo_url = result.hosted.ssh.replace('#' + res.hosted.committish, '')

        let ps = spawnSync('git', [ `clone ${repo_url} tmp/${hash}` ], { shell: true, encoding: 'utf-8' })

        if (res.hosted.committish) {
          ps = spawnSync('git', [ `checkout ${res.hosted.committish}` ], { shell: true, encoding: 'utf-8', cwd: `tmp/${hash}` })
        }

        if (ps.error || ps.status != 0) {
          return reject(ps)
        }

        resolve( pth )
      })
    })
  })

  promise.catch((err) => {
    console.log(err)
  })

  return promise
}

module.exports = Boilerplate