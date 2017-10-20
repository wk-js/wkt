'use strict'

const Chunks   = require('../chunks')
const Template = require('../template')
const Print    = require('../print')

const { js_beautify }
= require('js-beautify')
const { join }
= require('path')
const { ensureFileSync, writeFileSync }
= require('fs-extra')
const { input }
= require('../ask')

module.exports = {

  initialize() {
    this.chunks = new Chunks
    this.chunks.autocreate = true
    this.manager.config('chunks', this.chunks)

    this.manager.config('files', {})

    this.manager.stack.add( 'ask_name'   , this.t_ask_name   )
    this.manager.stack.add( 'fetch_files', this.t_fetch_files)
    this.manager.stack.add( 'configure'  , this.t_configure  )
    this.manager.stack.add( 'render'     , this.t_render     )
    this.manager.stack.add( 'make'       , this.t_make       )
    this.manager.stack.add( 'clean'      , this.t_clean      )

    this.manager.mixin(require('./file_mixin'))

    // Remove itself
    this.manager.workflow( this )
  },

  methods: {

    /**
     * Tasks
     *
     * @returns
     */
    t_ask_name() {
      return input(Print.ask.format('Project name: ')).then((name) => {
        this.parameters.output = join( this.parameters.output, name.length > 0 ? name : 'noname' )
      })
    },

    t_fetch_files() {
      return this.manager.boilerplates.execute( this, (bp) => {
        bp.call('fetch_files')
      })
    },

    t_configure() {
      return this.manager.boilerplates.execute( this, (bp) => {
        return bp.call('configure')
      })
    },

    t_render() {
      let content

      for (const file in this.files) {
        content = this.files[file].toString('utf-8')

        if (content.match(/chunk\(/)) {
          this.files[file] = content = Template.render(content, {
            interpolate: /{{([\s\S]+?)}}/g
          }, {
            chunk: (key) => {
              return this.chunks.get( key ).join('\n\n')
            }
          })
        }

        if (file.match(/\.js$/)) {
          this.files[file] = js_beautify(content, {
            indent_size: 2,
            max_preserve_newlines: 2
          })
        }
      }
    },

    t_make() {
      for (const file in this.files) {
        ensureFileSync( join(this.parameters.output, file) )
        writeFileSync(  join(this.parameters.output, file), this.files[file] )
      }
    },

    t_clean() {
      return this.manager.boilerplates.execute( this, (bp) => {
        return bp.call('clean')
      })
    }

  }

}