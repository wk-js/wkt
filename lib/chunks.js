'use strict'

const Configure       = require('./configure')
const { js_beautify } = require('js-beautify')

function NOOP(){}

class Chunks extends Configure {

  add(key, contentFn) {
    if (!this.tasks.hasOwnProperty(key)) this.order.push( key )
    this.tasks[key] = this._getChunk( contentFn || NOOP )
  }

  _getChunk(contentFn) {
    contentFn = contentFn || NOOP

    let content = contentFn.toString()
    content     = content.replace(/(^function.+\{(\n?)|\(\)\s ?= >\s?\{?)/, '\n')
    content     = content.replace(/\}$/, '')

    return js_beautify(content, { indent_size: 2 })
  }

  get(key) {
    const regex = new RegExp(`^${key}`)

    return this.order

    .filter((k) => {
      return k.match(regex)
    })

    .map((k) => {
      return this.tasks[k]
    })
  }

  execute() {
    return Promise.resolve( this.tasks )
  }

}

module.exports = Chunks