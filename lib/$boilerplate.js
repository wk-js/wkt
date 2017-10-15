'use strict'

const Configure       = require('./configure')
const Chunk           = require('./chunk')
const Template        = require('./template')
const { js_beautify } = require('js-beautify')

const { join, resolve }
= require('path')

const { readdirSync, readFileSync, accessSync, statSync }
= require('fs')

const { ensureFileSync, writeFileSync }
= require('fs-extra')

const { spawnSync }
= require('child_process')

const { toSlug }
= require('lol/utils/string')

const { FileList }
= require('filelist')

const BOILERPLATES_PATH = join(__dirname, '../boilerplates')
const BOILERPLATES = readdirSync( BOILERPLATES_PATH )

const IGNORES = [
  '.DS_Store',
  '.git',
  'node_modules',
  'npm-debug.*',
  /\.template\.js$/
]

function NOOP() {}

class Boilerplate {

  // constructor(keyOrPathOrRepository, parent) {
  constructor( path ) {
    [ 'mmake', 'cconfigure', 'save' ].forEach((k) => this[k] = this[k].bind(this))

    this.boilerplates = {}

    this.files  = {}
    this.chunks = {}
    this.output = '.'

    this.parent = null
    this.valid  = false
    this.name   = path
    this.path   = path

    this.action = NOOP
  }

  validate( path ) {
    this.name = path || this.path
    this.path = Boilerplate.resolve( path || this.path )

    try {
      this.action = require( this.path )
      this.valid  = true
    } catch(e) {
      console.log( e )
      return false
    }

    return true
  }

  setup() {
    if (!this.valid) return

    // Setup
    this.chunk     = new Chunk( this )
    this.configure = new BoilerplateConfigure( this )

    // Fetch chunks and configurations
    this.action.call( this, this )

    // Fetch files
    const FL = new FileList
    FL.include( join(this.path, 'content/**/*') )

    IGNORES.forEach((ignore) => FL.exclude(ignore))

    FL.forEach((file) => {
      const stat = statSync(file)
      if (!stat.isFile()) return

      const f       = file.replace(new RegExp(`${this.path}/content/`), '')
      this.files[f] = readFileSync( file, 'utf-8' )

      // Fetch chunks
      const matches = this.files[f].match(/CHUNKS\[.+\]/g)
      if (!matches) return

      matches.forEach((match) => {
        const task_key        = match.replace(/CHUNKS\[('|")/, '').replace(/('|")\]$/, '')
        this.chunks[task_key] = this.chunks[task_key] || []
        this.chunk.add(task_key)
      })
    })
  }

  // prepare() {
  //   return this.configure.execute()
  // }

  // make() {
  //   return this.chunk.execute()
  // }

  cconfigure() {
    return this.configure.execute().then(() => {
      this.make = this.configure.clone()
      this.make.configured = false

      this.make.order.forEach((key) => {
        if (key == this.name) {
          this.make.order.splice(this.make.order.indexOf(key), 1)
          return
        }

        this.make.tasks[key] = () => {
          const bp = this.boilerplates[key]
          return bp.chunk.execute().then(() => {
            this.files  = Object.assign(this.files, bp.files)
            this.chunks = Object.assign(this.chunks, bp.chunks)
          })
        }
      })
    })
  }

  mmake() {
    console.log('\n')
    return this.make.execute()
  }

  save() {
    for (const file in this.files) {
      if (this.files[file].match(/CHUNKS/)) {
        this.files[file] = Template.render(this.files[file], {}, {
          CHUNKS: this.chunks
        })
      }

      if (file.match(/\.js$/)) {
        this.files[file] = js_beautify(this.files[file], {
          indent_size: 2,
          max_preserve_newlines: 2
        })
      }

      ensureFileSync( join(this.output, file) )
      writeFileSync(  join(this.output, file), this.files[file] )
    }
  }

}

Boilerplate.boilerplates = {}

Boilerplate.find = function( path ) {
  return Boilerplate.boilerplates[path]
}

Boilerplate.findOrCreate = function( options ) {
  return Boilerplate.find( options.path ) || new Boilerplate( options )
}

Boilerplate.resolve = function(keyOrPathOrRepository) {

  let path

  // Is prebuilt boilerplate
  if ( BOILERPLATES.indexOf(keyOrPathOrRepository) !== -1 ) {
    path = join( BOILERPLATES_PATH, keyOrPathOrRepository )
  }

  // Is a boilerplate path
  if (!path) {
    try {
      path = resolve( keyOrPathOrRepository )
      accessSync( path )
    } catch(e) {
      path = undefined
    }
  }

  // Is a git repository
  if (!path) {
    const hash = toSlug( keyOrPathOrRepository )
    path = `${process.cwd()}/tmp/${hash}`

    try {
      accessSync(path)
      return path
    } catch(e) {
      console.log(`Git clone ${keyOrPathOrRepository}`)
    }

    const repo     = keyOrPathOrRepository.split('#')
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

class BoilerplateConfigure extends Configure {

  constructor( context ) {
    super( context )
    this.add( '__configure' )
  }

  before( key ) {
    super.before( '__configure', key)
  }

  after( key ) {
    super.after( '__configure', key)
  }

  add( key ) {
    if (key === '__configure') { super.add( '__configure' ); return Promise.resolve() }

    const bp = new Boilerplate( key )

    if (!bp.validate()) {
      return Promise.reject( `Invalid boilerplate ${key}` )
    }

    bp.setup()
    this.context.boilerplates[bp.name] = bp

    super.add( bp.name, function() {
      return bp.cconfigure()
    })
  }

  execute() {
    this.tasks[this.context.name] = this.tasks['__configure']
    const index = this.order.indexOf('__configure')

    this.order.splice(index, 1)
    this.order.splice(index, 0, this.context.name)

    return Promise.resolve()
    // return super.execute()
  }

  logger() {
    const args = [ `[configure ${this.context.name}]` ].concat(Array.prototype.slice.call(arguments))
    super.logger.apply( this, args )
  }

}

// class BoilerplateConfigure extends Configure {

//   constructor( context ) {
//     super( context )
//     this.add( '__configure' )
//   }

//   initializeBoilerplate( keyOrPathOrRepository ) {
//     const bp = new Boilerplate({
//       path: keyOrPathOrRepository,
//       parent: this._context
//     })

//     if (!bp.valid) return Promise.reject( new Error('Invalid boilerplate') )

//     this.make.add(bp.name, function() {
//       this.files  = Object.assign(this.files, bp.files)
//       this.chunks = Object.assign(this.chunks, bp.chunks)
//     })

//     bp.cconfigure()
//   }

//   before( keyOrPathOrRepository ) {
//     super.before( '__configure', keyOrPathOrRepository, function() {
//       this.make.before( '__make', keyOrPathOrRepository )
//     })
//   }

//   after( keyOrPathOrRepository ) {
//     super.after( '__configure', keyOrPathOrRepository, function() {
//       this.make.after( '__make', keyOrPathOrRepository )
//     })
//   }

//   add( key, fn ) {
//     super.add( key, fn )
//   }

//   logger() {
//     const args = [ `[prepare ${this._context.name}]` ].concat(Array.prototype.slice.call(arguments))
//     super.logger.apply( this, args )
//   }

// }

// class StackConfigure extends Configure {

//   constructor( context ) {
//     super( context )
//     this.add( '__make' )
//   }

//   add( path ) {
//     // if (path == '__make') { super.add( '__make' ); return Promise.resolve() }

//     // const bp = new Boilerplate({
//     //   path: path,
//     //   parent: this._context
//     // })

//     // if (!bp.valid) return Promise.reject( new Error('Invalid boilerplate') )

//     // super.add(bp.name, () => {
//     //   return bp.prepareChunk().then(() => {
//     //     this._context.files  = Object.assign(this._context.files, bp.files)
//     //     this._context.chunks = Object.assign(this._context.chunks, bp.chunks)
//     //   })
//     // })

//     // return bp.cconfigure()
//   }

//   logger() {
//     const args = [ `\n[boilerplate]` ].concat(Array.prototype.slice.call(arguments))
//     super.logger.apply( this, args )
//   }

// }

module.exports = Boilerplate