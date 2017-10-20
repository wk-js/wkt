'use strict'

const when = require('when')
const path = require('path')
const fs   = require('fs-extra')

const { FileList }
= require('filelist')

module.exports = {
  include_files: [ '.gitkeep' ],
  exclude_files: [],

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
  },

  fetch_files() {
    try {
      fs.statSync(path.join(this.path, 'content'))
    } catch(e) { return }

    const FL = new FileList
    FL.include( path.join(this.path, 'content/**/*') )
    this.include_files.forEach(inc => FL.include( path.join(this.path, `content/**/${inc}`) ))
    this.exclude_files.forEach(exc => FL.exclude( path.join(this.path, `content/**/${exc}`) ))

    FL.forEach((file) => {
      const stat = fs.statSync(file)
      if (!stat.isFile()) return

      const key = file.replace(new RegExp(`${this.path}/content/`), '')
      this.files[key] = fs.readFileSync( file )
    })
  },

  clean() {
    if (this.path.match(new RegExp(`${process.cwd()}/.tmp`))) {
      fs.removeSync( this.path )
    }
  }
}