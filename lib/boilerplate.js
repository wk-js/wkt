'use strict'

const { FileList }                           = require('filelist')
const { join, resolve, basename }            = require('path')
const when                                   = require('when')
const { readFileSync, accessSync, statSync } = require('fs')
const { spawnSync }                          = require('child_process')
const { toSlug }                             = require('lol/utils/string')
const npa                                    = require('npm-package-arg')
const npa2                                   = require('realize-package-specifier')

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
    FL.include( join(this.path, 'content/**/*') )
    this.ignored_files.forEach(ignore => FL.exclude(ignore))

    FL.forEach((file) => {
      const stat = statSync(file)
      if (!stat.isFile()) return

      const key = file.replace(new RegExp(`${this.path}/content/`), '')
      this.manager.file(key, readFileSync( file, 'utf-8' ))
    })

    this.configure()
  }
}

Boilerplate.create = function( pathOrRepo ) {
  return Boilerplate.resolve( pathOrRepo ).then((path) => {
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
  })
}

Boilerplate.resolve = function( pathOrRepo ) {

  let path

  // Is a boilerplate path
  try {
    path = resolve(  pathOrRepo  )
    accessSync( path )
    return when.resolve( path )
  } catch(e) {}

  // Is a git repository
  return when.promise(function(resolve, reject) {
    const res = npa.resolve('lol', pathOrRepo)

    npa2(pathOrRepo, function(error, result) {
      if (error) {
        return reject(error)
      }

      const hash = toSlug( pathOrRepo )
      path = `${process.cwd()}/tmp/${hash}`
      const repo_url = result.hosted.ssh.replace('#' + res.hosted.committish, '')

      spawnSync('git', [ `clone ${repo_url} tmp/${hash}` ], { shell: true, encoding: 'utf-8' })

      if (res.hosted.committish) {
        spawnSync('git', [ `checkout ${res.hosted.committish}` ], { shell: true, encoding: 'utf-8', cwd: `tmp/${hash}` })
      }

      resolve( path )
    })
  })

  // return when.promise(function(resolve, reject) {
  //   let path

  //   // Is a boilerplate path
  //   path = resolve(  pathOrRepo  )
  //   accessSync( path )
  //   resolve(path)

  //   // Is a git repository
  //   return when.promise(function(resolve, reject) {
  //     npa2('git+ssh://git@github.com:wk-js/starter-vue.git', function(error, result) {
  //       if (error) {
  //         return reject(error)
  //       }


  //     })
  //   })

  //   // // Is a git repository
  //   // if (!path) {
  //   //   const hash = toSlug(  pathOrRepo  )
  //   //   path = `${process.cwd()}/tmp/${hash}`


  //   //   // const result = npa.resolve('test', pathOrRepo)

  //   //   // console.log(result)

  //   //   // template2(result.hosted.gittemplate, result.hosted, {
  //   //   //   open:  '{',
  //   //   //   close: '}'
  //   //   // })

  //   //   // git+ssh://git@github.com/visionmedia/express.git
  //   //   // git+ssh://git@github.com:wk-js/starter-vue.git

  //   //   console.log(npa2('git+ssh://git@github.com:wk-js/starter-vue.git', function(error, result) {
  //   //     console.log(result)
  //   //   }))

  //   //   try {
  //   //     accessSync(path)
  //   //     return path
  //   //   } catch(e) {
  //   //     console.log(`Git clone ${ pathOrRepo }`)
  //   //   }

  //   //   const repo     =  pathOrRepo .split('#')
  //   //   const repo_url = repo[0]
  //   //   const commit   = repo[1]
  //   //   let res

  //   //   res = spawnSync('git', [ `clone ${repo_url} tmp/${hash}` ], { shell: true, encoding: 'utf-8' })

  //   //   if (commit) {
  //   //     res = spawnSync('git', [ `checkout ${commit}` ], { shell: true, encoding: 'utf-8', cwd: `tmp/${hash}` })
  //   //   }

  //   //   if (res.error || res.status != 0) {
  //   //     path = undefined
  //   //     console.log(new Error(`An error occured`))
  //   //     console.log(res)
  //   //   }
  //   // }

  //   // return path

  // })

}

module.exports = Boilerplate