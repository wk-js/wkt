'use strict'

const Configure       = require('./configure')
const { js_beautify } = require('js-beautify')

class Chunks extends Configure {

  add(key, contentFn) {
    if (!contentFn) return

    let content = contentFn.toString()
    content     = content.replace(/(^function.+\{(\n?)|\(\)\s ?= >\s?\{?)/, '\n')
    content     = content.replace(/\}$/, '')

    const chunk = js_beautify(content, { indent_size: 2 })

    const chunks = this.tasks[key] || []
    chunks.push( chunk )

    super.add(key, chunks)
  }

  execute() {
    return Promise.resolve( this.tasks )
  }

}

module.exports = Chunks