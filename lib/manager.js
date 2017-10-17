'use strict'

const Boilerplate = require('./boilerplate')
const Configure   = require('./configure')
const Chunks      = require('./chunks')
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

    const bound = [ 'taskConfigure', 'taskRender', 'taskMake', 'taskClean' ]
    bound.forEach(b => this[b] = this[b].bind(this))

    this.files  = {}
    this.chunks = new Chunks
    this.chunks.autocreate = true

    this.pending = {}
    this.pending.promise = when.promise((resolve, reject) => {
      this.pending.resolve = resolve
      this.pending.reject  = reject
    })

    this._addPromises   = []

    this.stack = new Configure
    this.stack.silent = true
    this.stack.add( 'configure', this.taskConfigure )
    this.stack.add( 'render'   , this.taskRender    )
    this.stack.add( 'make'     , this.taskMake      )
    this.stack.add( 'clean'    , this.taskClean     )

    this.output = '.tmp/lol'
  }

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

  before(before, key, fn) {
    return this.add(key, fn).then((bp) => {
      if (bp) this.reorder(before, bp.name)
    })
  }

  after(after, key, fn) {
    return this.add(key, fn).then((bp) => {
      if (bp) this.reorder(after, bp.name, 'after')
    })
  }

  reorder() {
    super.reorder.apply(this, arguments)
  }

  add( key ) {
    return Boilerplate.create( key ).then((bp) => {

      if (bp) {
        super.add( bp.name, bp )
        bp.manager = this

        if (bp.dependencies) {
          return when.all(bp.dependencies()).then(() => bp)
        }

        return bp
      }

      return null
    })
  }

  logger() {
    const args = Array.prototype.slice.apply(arguments)
    args.unshift('[manager]')
    super.logger.apply(this, args)
  }

  execute() {
    return this.stack.execute()
  }

  /**
   * Task: Configure
   *
   * @returns {Promise}
   * @memberof Manager
   */
  taskConfigure() {
    return super.execute( this, (bp) => {
      return bp._configure()
    })
  }

  /**
   * Task: Render
   *
   * @returns {Promise}
   * @memberof Manager
   */
  taskRender() {
    for (const file in this.files) {
      if (this.files[file].match(/chunk\(/)) {
        this.files[file] = Template.render(this.files[file], {}, {
          chunk: (key) => {
            return this.chunks.tasks[key] || []
          }
        })
      }

      if (file.match(/\.js$/)) {
        this.files[file] = js_beautify(this.files[file], {
          indent_size: 2,
          max_preserve_newlines: 2
        })
      }
    }
  }

  /**
   * Task: Make
   *
   * @returns {Promise}
   * @memberof Manager
   */
  taskMake() {
    for (const file in this.files) {
      ensureFileSync( join(this.output, file) )
      writeFileSync(  join(this.output, file), this.files[file] )
    }
  }

  taskClean() {
    let bp

    for (const key in this.tasks) {
      bp = this.tasks[key]
      bp.clean()
    }
  }

}

module.exports = Manager