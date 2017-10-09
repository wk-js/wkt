'use strict'

module.exports = function() {

  this.chunk.after('Wkfile', 'Wkfile:templates', function() {
    wk.require('template', true)
  })

  this.chunk.file('package.json', function(content) {

    const pkg = JSON.parse(content)

    pkg.dependencies = Object.assign(pkg.dependencies, {
      "filelist": "github:FuriouZz/filelist#61e3e7dfa8fa257f232f09fa14265807f40c8570",
      "fs-extra": "1.0.0",
      "lodash.template": "4.4.0",
      "lol": "github:makemepulse/lol.js#0.0.4"
    })

    return JSON.stringify(pkg)

  })

}