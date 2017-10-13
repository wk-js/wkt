'use strict'

const when            = require('when')
const Configure       = require('./configure')
const { js_beautify } = require('js-beautify')

class Chunk extends Configure {

  before(before, key, fn) {
    if (this.order.indexOf(before) == -1) {
      this.add( before )
    }

    super.before(before, key, fn)
    this.tasks[key].referer = before
  }

  after(after, key, fn) {
    if (this.order.indexOf(after) == -1) {
      this.add( after )
    }

    super.after(after, key, fn)
    this.tasks[key].referer = after
  }

  add(key, contentFn) {
    const action = () => {
      if (!contentFn) return

      const referer = action.referer || key

      let content = contentFn.toString()
      content     = content.replace(/(^function.+\{(\n?)|\(\)\s ?= >\s?\{?)/, '\n')
      content     = content.replace(/\}$/, '')

      this.context.chunks[referer] = this.context.chunks[referer] || []
      this.context.chunks[referer].unshift( js_beautify(content, { indent_size: 2 }) )
    }

    super.add(key, action)
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
    const args = [ `[chunk ${this.context.name}]` ].concat(Array.prototype.slice.call(arguments))
    super.logger.apply( this, args )
  }

}

module.exports = Chunk