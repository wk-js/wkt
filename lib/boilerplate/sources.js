'use strict'

const sources = {}

function getPath(key) {
  if (sources[key]) {
    return key
  }

  for (const path in sources) {
    if (sources[path].indexOf(key) > -1) return path
  }

  return null
}

function registerPath( path, key ) {
  sources[path] = sources[path] || []
  if (sources[path].indexOf(key) === -1) sources[path].push( key )
}

module.exports = {
  get:      getPath,
  register: registerPath,
  sources:  sources
}