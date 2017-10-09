'use strict'

const fs                   = require('fs-extra')
const { FileList }         = require('filelist')
const { join, isAbsolute } = require('path')
const { js_beautify }      = require('js-beautify')
const Configure            = require('./configure')
const Template             = require('./template')
const when                 = require('when')

const IGNORES = [
  '.DS_Store',
  '.git',
  '.idea',
  '.history',
  'node_modules',
  'npm-debug.*',
  'tmp'
]

class Resolver {

  constructor() {
    this.files  = {}
    this.chunks = {}
    this.boilerplates = []

    this.silent = false

    this.configure = new Configure( this )
  }

  boilerplate(keyOrPath, params) {
    const path = Resolver.resolve(keyOrPath)
    if (!path) return

    if (this.boilerplates.indexOf(path) !== - 1) return
    this.boilerplates.push( path )

    const pendings = []

    const FL = new FileList
    FL.include( join(path, '**/*') )

    IGNORES.forEach((ignore) => FL.exclude(ignore))

    FL.forEach((file) => {

      const stat = fs.statSync(file)
      if (!stat.isFile()) return

      const f = file.replace(new RegExp(`${path}/`), '')

      // Handle template file
      if (file.match(/\.template\.js$/)) {
        pendings.push( file )
        return
      }

      // Read file
      this.files[f] = fs.readFileSync( file, 'utf-8' )

      // Fetch chunks
      const matches = this.files[f].match(/CHUNKS\[.+\]/g)
      if (!matches) return

      matches.forEach((match) => {
        const task_key        = match.replace(/CHUNKS\[('|")/, '').replace(/('|")\]$/, '')
        this.chunks[task_key] = this.chunks[task_key] || []
        this.configure.add(task_key)
      })
    })


    // Execute pendings
    pendings.forEach((file) => {
      require(file).call( this, params )
    })
  }

  file(key, callback) {
    if (this.files[key]) {
      const value = callback(this.files[key])

      if (!when.isPromiseLike(value) && typeof value === 'string') {
        this.files[key] = value
        return
      }

      value.then((v) => {
        if (typeof value === 'string') {
          this.files[key] = v
        }
      })
    }
  }

  make(destination) {
    if (!destination) return when.reject(new Error('No destination!'))

    // Transform chunk contents to string
    for (const key in this.configure._tasks) {
      const referer = this.configure._tasks[key].referer
      if (!referer) continue

      let content   = this.configure._tasks[key].toString()
      content       = content.replace(/(^function.+\{(\n?)|\(\)\s?=>\s?\{?)/, '\n')
      content       = content.replace(/\}$/, '')

      this.configure._tasks[key] = () => {
        this.chunks[referer] = this.chunks[referer] || []
        this.chunks[referer].unshift( js_beautify(content, { indent_size: 2 }) )
      }
    }

    // Execute
    return this.configure.execute().then(() => {
      for (const file in this.files) {
        if (this.files[file].match(/CHUNKS/)) {
          this.files[file] = Template.render(this.files[file], {}, {
            CHUNKS: this.chunks
          })
        }

        this.files[file] = js_beautify(this.files[file], {
          indent_size: 2,
          max_preserve_newlines: 2
        })

        fs.ensureFileSync( join(destination, file) )
        fs.writeFileSync( join(destination, file), this.files[file] )
      }
    })
  }

  logger() {
    if (!this.silent) console.log.apply(null, arguments)
  }

}

Resolver.resolve = function(keyOrPath) {
  let path
  const bps = fs.readdirSync( join(__dirname, '../boilerplates') )

  if (bps.indexOf(keyOrPath) !== -1) {
    path = join( __dirname, '../boilerplates', keyOrPath )
  } else {
    path = keyOrPath

    if (!isAbsolute(path)) path = join( process.cwd(), path )
  }

  try {
    fs.accessSync(path)
  } catch(e) {
    return undefined
  }

  return path
}

module.exports = Resolver