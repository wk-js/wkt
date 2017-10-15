'use strict'

const Boilerplate = require('./boilerplate')
const Configure   = require('./configure')
const Chunk       = require('./chunk')
const when        = require('when')
const Template        = require('./template')
const { js_beautify } = require('js-beautify')

const { join }
= require('path')

const { ensureFileSync, writeFileSync }
= require('fs-extra')

class Manager extends Configure {

  constructor() {
    super()

    const bound = [ 'configure', 'make' ]
    bound.forEach((k) => this[k] = this[k].bind(this))

    this.boilerplates = {}
    this.files        = {}
    this.chunks       = {}
    this.output       = '.tmp/lol'
  }

  chunk(key) {
    return this.chunks[key] = this.chunks[key] || new Chunk( this, key )
  }

  // file(key, content) {
  //   if (content) this.files[key] = content
  //   return this.files[key]
  // }

  file(key, callback) {
    if (typeof callback === 'function') {
      const value = callback(this.files[key])

      if (!when.isPromiseLike(value) && typeof value === 'string') {
        return this.files[key] = value
      }

      return value.then((v) => {
        if (typeof value === 'string') {
          this.files[key] = v
        }
      })
    }

    if (callback && typeof callback == 'string')
      this.files[key] = callback

    return this.files[key]
  }

  before( before, key ) {
    if (this.boilerplates[before]) {
      const bp = this.add( key )
      if (bp) this.reorder( bp.name, before )
    }
  }

  after( after, key ) {
    if (this.boilerplates[after]) {
      const bp = this.add( key )
      if (bp) this.reorder( bp.name, after, 'after' )
    }
  }

  add( key ) {
    const bp = Boilerplate.create( key )
    if (bp) {
      super.add( bp.name, bp._configure )
      this.boilerplates[bp.name] = bp
      bp.manager = this
      bp.dependencies ? bp.dependencies() : void(0)
      return bp
    }

    return null
  }

  configure() {
    return super.execute()
    .then(() => {
      return when.all(Object.keys(this.chunks).map((k) => this.chunks[k].execute()))
    })
  }

  make() {
    // let chunks = Object.keys(this.chunks).map((k) => this.chunks[k].results)
    // chunks = Array.prototype.concat.apply([], chunks)

    for (const file in this.files) {
      if (this.files[file].match(/chunk\(/)) {
        this.files[file] = Template.render(this.files[file], {}, {
          chunk: (key) => {
            const chunk = this.chunk(key)
            return chunk ? chunk.results : []
          }
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

  execute() {
    return this.configure().then(this.make)
  }
}

module.exports = Manager