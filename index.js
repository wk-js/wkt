'use strict'

global.Application = {
  silent: true,

  logger() {
    if (!this.silent) console.log.apply(null, arguments)
  }
}

// Prepare configuration
const Configure = new (require('./lib/configure'))
const Template  = require('./lib/template')

// Get files / templates
const fs       = require('fs-extra')
const FileList = require('filelist').FileList
const beautify = require('js-beautify').js_beautify
const { merge } = require('lol/utils/object')

const FL     = new FileList
const FILES  = {}
const CHUNKS = {}
const WAIT   = []
const bps    = [ '_default', 'assets', 'git', 'i18n', 'environments', 'package', 'webpack', 'templates' ]

bps.forEach(function(bp) {
  FL.include(`./boilerplates/${bp}/**/*`)
})

FL.exclude('.DS_Store')
FL.forEach(function(file) {
  const stat = fs.statSync(file)
  if (stat.isFile()) {
    const f = file.replace(new RegExp(`boilerplates/(${bps.join('|')})/`), '')

    if (file.match(/\.template\.js$/)) {
      WAIT.push(file)
    }

    else {
      FILES[f] = fs.readFileSync( file, 'utf-8' )

      const matches = FILES[f].match(/CHUNKS\[.+\]/g)

      if (matches) {
        matches.forEach(function(match) {
          const task_key = match.replace(/CHUNKS\[('|")/, '').replace(/('|")\]$/, '')
          CHUNKS[task_key] = []
          Configure.add(task_key)
        })
      }
    }
  }
})

WAIT.forEach(function(file) {
  require('./' + file).call( Configure )
})

// Prepare content fetch
for (const key in Configure._tasks) {
  const referer = Configure._tasks[key].referer
  if (!referer) continue

  let content   = Configure._tasks[key].toString()
  content       = content.replace(/(^function.+\{(\n?)|\(\)\s?=>\s?\{?)/, '\n')
  content       = content.replace(/\}$/, '')

  Configure._tasks[key] = function() {
    CHUNKS[referer] = CHUNKS[referer] || []
    CHUNKS[referer].unshift( beautify(content, { indent_size: 2 }) )
  }
}


// Fetch content
Configure.execute().then(() => {
  const tmp = process.cwd() + '/tmp'

  fs.removeSync(tmp)

  for (const file in FILES) {
    if (FILES[file].match(/CHUNKS/)) {
      FILES[file] = Template.render(FILES[file], {}, {
        CHUNKS: CHUNKS
      })
    }

    FILES[file] = beautify(FILES[file], {
      indent_size: 2,
      max_preserve_newlines: 2
    })

    fs.ensureFileSync( tmp + '/' + file )
    fs.writeFileSync( tmp + '/' + file, FILES[file] )
  }

})