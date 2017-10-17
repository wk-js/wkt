'use strict'

const Configure       = require('./configure')
const { js_beautify } = require('js-beautify')

function NOOP(){}

class Chunks extends Configure {

  constructor() {
    super()
    this._tasks = {}
  }

  before(key, content) { this._add(key, content, 0) }
  add(key, content)    { this._add(key, content, 1) }
  after(key, content)  { this._add(key, content, 2) }

  _add(key, content, index) {
    const chunks = this._tasks[key] = this._tasks[key] || [[], [], []]
    chunks[index].push( this._getChunk( content ) )
    super.add(key, Array.prototype.concat.apply([], chunks))
  }

  _getChunk(contentFn) {
    contentFn = contentFn || NOOP

    let content = contentFn.toString()
    content     = content.replace(/(^function.+\{(\n?)|\(\)\s ?= >\s?\{?)/, '\n')
    content     = content.replace(/\}$/, '')

    return js_beautify(content, { indent_size: 2 })
  }

  execute() {
    return Promise.resolve( this.tasks )
  }

}

module.exports = Chunks