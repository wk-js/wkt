'use strict'

const fs                   = require('fs-extra')
const { FileList }         = require('filelist')
const { join, isAbsolute } = require('path')
const { js_beautify }      = require('js-beautify')
const { spawnSync }        = require('child_process')
const crypto               = require('crypto')
const Configure            = require('./configure')
const Template             = require('./template')
const when                 = require('when')

const IGNORES = [
  '.DS_Store',
  '.git',
  '.idea',
  '.history',
  'node_modules',
  'npm-debug.*'
]

class Boilerplate {

  constructor( keyOrPathOrRepo, params ) {
    this.files  = {}
    this.chunks = {}
    this.boilerplates = []

    this.silent = false

    this.chunk = new Configure( this )
    this.chunk.file = (key, callback) => {
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

    this.configure = new Configure( this )
    this.configure.add( 'boilerplate' )
    this.boilerplate( keyOrPathOrRepo, params )
  }

  boilerplate(keyOrPath, params) {
    const path = Boilerplate.resolve(keyOrPath)
    if (!path) return

    if (this.boilerplates.indexOf(path) !== - 1) return
    this.boilerplates.push( path )

    const pendingCalls = []

    const FL = new FileList
    FL.include( join(path, '**/*') )

    IGNORES.forEach((ignore) => FL.exclude(ignore))

    FL.forEach((file) => {

      const stat = fs.statSync(file)
      if (!stat.isFile()) return

      const f = file.replace(new RegExp(`${path}/`), '')

      // Handle template file
      if (file.match(/\.template\.js$/)) {
        pendingCalls.push( file )
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
        this.chunk.add(task_key)
      })
    })


    // Execute pendingCalls
    pendingCalls.forEach((file) => {
      require(file).call( this, params )
    })
  }

  make(destination) {
    if (!destination) return when.reject(new Error('No destination!'))

    // Execute boilerplate
    return this.configure.execute()

    // Transform chunk contents to string
    .then(() => {
      for (const key in this.chunk._tasks) {
        const referer = this.chunk._tasks[key].referer
        if (!referer) continue

        let content   = this.chunk._tasks[key].toString()
        content       = content.replace(/(^function.+\{(\n?)|\(\)\s?=>\s?\{?)/, '\n')
        content       = content.replace(/\}$/, '')

        this.chunk._tasks[key] = () => {
          this.chunks[referer] = this.chunks[referer] || []
          this.chunks[referer].unshift( js_beautify(content, { indent_size: 2 }) )
        }
      }
    })

    // Fetch chunks
    .then(this.chunk.execute)

    // Create files
    .then(() => {
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

        fs.ensureFileSync( join(destination, file) )
        fs.writeFileSync( join(destination, file), this.files[file] )
      }
    })
  }

  logger() {
    if (!this.silent) console.log.apply(null, arguments)
  }

}

Boilerplate.resolve = function(keyOrPath) {
  let path
  const bps = fs.readdirSync( join(__dirname, '../boilerplates') )

  // Test key
  if (bps.indexOf(keyOrPath) !== -1) {
    path = join( __dirname, '../boilerplates', keyOrPath )
  }

  // Test path
  if (!path) {
    path = keyOrPath

    if (!isAbsolute(path)) path = join( process.cwd(), path )

    try {
      fs.accessSync(path)
    } catch(e) {
      path = undefined
    }
  }

  // Test git
  if (!path) {
    const hash     = crypto.createHash('md5').update(Math.random().toString()).digest('hex')
    const repo     = keyOrPath.split('#')
    const repo_url = repo[0]
    const branch   = repo[1]
    let res

    path = `${process.cwd()}/tmp/${hash}`

    if (branch) {
      res = spawnSync('/bin/sh', [ '-c', `git clone -b ${branch} ${repo_url} tmp/${hash}` ])
    } else {
      res = spawnSync('/bin/sh', [ '-c', `git clone ${repo_url} tmp/${hash}` ])
    }

    if (res.error) {
      path = undefined
      console.log(res.error)
    }
  }

  return path
}

module.exports = Boilerplate