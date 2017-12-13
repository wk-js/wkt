'use strict'

const fs           = require('fs')
const path         = require('path')
const { FileList } = require('filelist')
const Resolver     = require('../resolver')
const API          = require('../api')
const Configure    = require('../configure')

class Boilerplate {

  constructor(file) {
    API.mixin( this )

    this.parse             = this.parse.bind(this)
    this.t_configure_files = this.t_configure_files.bind(this)

    this.files = []

    this.stack = new Configure
    this.stack.autocreate = true
    this.stack.silent = false

    Resolver.resolve(file)
            .then(this.parse)
  }

  get cwd() {
    return path.dirname(this.path)
  }

  parse(pth) {
    this.path = pth
    Function(fs.readFileSync(this.path, 'utf-8')).call(this.$api)

    // tmp
    this.execute()
  }

  execute() {
    for (const key in this.configs) {
      if (key === 'files') this.stack.add(`configure:${key}`, this.t_configure_files)
    }

    this.stack.execute()
  }

  t_configure_files() {
    const FL = new FileList

    this.configs['files'].forEach((item) => {
      if (typeof item === 'object') {
        if (item.exclude) FL.exclude( path.join(this.cwd, item.glob) )
        else              FL.include( path.join(this.cwd, item.glob) )
      } else if (typeof item === 'string') {
        FL.include( path.join(this.cwd, item) )
      }
    })

    FL.forEach((file) => {
      let stat

      try {
        stat = fs.statSync(file)
      } catch(e) { return }

      if (!stat.isFile()) return
      this.files.push( file )
    })
  }
}

Boilerplate._current      = null
Boilerplate._boilerplates = {}

Boilerplate.current = function(file) {
  if (file) {
    Boilerplate._current = Boilerplate._boilerplates[file]
  }

  return Boilerplate._current
}

Boilerplate.create = function(file) {
  const bp = new Boilerplate(file)
  if (!Boilerplate._current) Boilerplate._current = bp
  return bp
}

module.exports = Boilerplate