'use strict'

const Boilerplate = require('./boilerplate')
const Configure   = require('./configure')
const Chunks      = require('./chunks')
const when        = require('when')
const Template    = require('./template')
const Pending     = require('./pending')
const { ask }     = require('./ask')

const { js_beautify }                   = require('js-beautify')
const { join }                          = require('path')
const { ensureFileSync, writeFileSync } = require('fs-extra')

class Manager {

  constructor( parameters ) {
    const bound = [ '_add_boilerplate', '_create_or_ask', '_create_boilerplate', '_ask_boilerplate' ]
    bound.forEach(b => this[b] = this[b].bind(this))

    this.boilerplates = []
    this.files  = {}

    this.chunks = new Chunks
    this.chunks.autocreate = true

    this.stack = new ManagerStack
    this.stack.silent = true

    this.configure = new Configure

    const p = Pending('boilerplates', this._add_boilerplate)
    p.autoexec = false

    Pending('create', this._create_boilerplate)
    Pending('ask'   , this._ask_boilerplate)

    this.parameters = parameters
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

  before(before, key, optional) {
    return this.add( key, optional, { key: before, after: false } )
  }

  after(after, key, optional) {
    return this.add( key, optional, { key: after, after: true   } )
  }

  add( key, optional, reorder ) {
    return Pending('boilerplates').push( key, optional, reorder )
  }

  _add_boilerplate( key, optional, reorder ) {
    return this._create_or_ask( key, optional ).then((bp) => {
      if (bp && reorder) this.configure.reorder( bp.name, reorder.key, reorder.after )
      Pending('boilerplates').next()
      return bp
    })
  }

  _create_or_ask( key, optional ) {
    if (optional) return Pending('ask').push(key)
    return Pending('create').push(key)
  }

  _create_boilerplate( key ) {
    const promise = Boilerplate.create( key ).then((bp) => {
      if (bp) {
        this.configure.add( bp.name, bp )
        bp.manager = this
        if (bp.dependencies) bp.dependencies()
        return bp
      }

      return null
    })

    promise.then(Pending('create').next)

    return promise
  }

  _ask_boilerplate( key ) {
    const promise = ask(`[Ask] Add "${key}" module ? `, () => {
      return this._create_or_ask( key )
    })

    promise.then(Pending('ask').next)

    return promise
  }

}

class ManagerStack extends Configure {

  constructor() {
    super()

    this.add( 'setup'    , this.t_setup     )
    this.add( 'configure', this.t_configure )
    this.add( 'render'   , this.t_render    )
    this.add( 'make'     , this.t_make      )
    // this.add( 'clean'    , this.t_clean     )
    this.add('debug', function() {
      // console.log( Object.keys(this.files) )
    })
  }

  t_setup() {
    const pending = Pending('boilerplates')
    return pending.start().then(() => {
      if (!pending.empty) return this.stack.t_setup.call(this)
    })
  }

  t_configure() {
    return this.configure.execute( this, (bp) => {
      return bp._configure()
    })
  }

  t_render() {
    for (const file in this.files) {
      if (this.files[file].match(/chunk\(/)) {
        this.files[file] = Template.render(this.files[file], {
          interpolate: /{{([\s\S]+?)}}/g
        }, {
          chunk: (key) => {
            return this.chunks.get( key ).join('\n\n')
            // return (this.chunks.tasks[key] || []).join('\n\n')
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

  t_make() {
    for (const file in this.files) {
      ensureFileSync( join(this.parameters.output, file) )
      writeFileSync(  join(this.parameters.output, file), this.files[file] )
    }
  }

  t_clean() {
    let bp

    for (const key in this.tasks) {
      bp = this.tasks[key]
      bp.clean()
    }
  }

}

module.exports = Manager