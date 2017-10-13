'use strict'

const Configure   = require('./configure')
const Boilerplate = require('./boilerplate')
const Template    = require('./template')

const { ensureFileSync, writeFileSync }
= require('fs-extra')

const { join }
= require('path')

const { js_beautify }
= require('js-beautify')

class Resolver {

  constructor( output ) {
    [ 'make', 'save' ].forEach((k) => this[k] = this[k].bind(this))

    this.output        = output
    this._boilerplates = {}

    this.files  = {}
    this.chunks = {}

    this.configure = new ResolverConfigure( this )

    console.log('[prepare boilerplate]')
  }

  make() {
    return this.configure.execute()
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

class ResolverConfigure extends Configure {

  add( path ) {
    const bp = new Boilerplate( path, this._context )
    if (!bp.valid) return Promise.reject( 'Invalid boilerplate' )

    this._context._boilerplates[bp.name] = bp

    super.add(bp.name, () => {
      return bp.make().then(() => {
        this._context.files  = Object.assign(this._context.files, bp.files)
        this._context.chunks = Object.assign(this._context.chunks, bp.chunks)
      })
    })

    return bp.prepare()
  }

  logger() {
    const args = [ `\n[boilerplate]` ].concat(Array.prototype.slice.call(arguments))
    super.logger.apply( this, args )
  }

}

module.exports = Resolver