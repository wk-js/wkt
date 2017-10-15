'use strict'

const when            = require('when')
const Configure       = require('./configure')
const { js_beautify } = require('js-beautify')

class Chunk extends Configure {

  constructor( context, name ) {
    super(context)

    this.name = name
  }

  before(before, key, fn) {
    if (this.order.indexOf(before) == -1) {
      this.add( before )
    }

    super.before(before, key, fn)
  }

  after(after, key, fn) {
    if (this.order.indexOf(after) == -1) {
      this.add( after )
    }

    super.after(after, key, fn)
  }

  add(key, contentFn) {
    const action = () => {
      if (!contentFn) return ''

      let content = contentFn.toString()
      content     = content.replace(/(^function.+\{(\n?)|\(\)\s ?= >\s?\{?)/, '\n')
      content     = content.replace(/\}$/, '')

      return js_beautify(content, { indent_size: 2 })
      // this.context._chunks[this.name] = this.context._chunks[this.name] || []
      // this.context._chunks[this.name].unshift( js_beautify(content, { indent_size: 2 }) )
    }

    super.add(key, action)
  }

  execute() {
    return super.execute()
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

  logger() {
    const args = [ `[chunk ${this.name}]` ].concat(Array.prototype.slice.call(arguments))
    super.logger.apply( this, args )
  }

}

module.exports = Chunk