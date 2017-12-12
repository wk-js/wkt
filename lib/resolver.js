'use strict'

const when       = require('when')
const fs         = require('fs')
const { toSlug } = require('lol/utils/string')
const npa2       = require('realize-package-specifier')
const git        = require('./git')

const _sources = {}

function resolve( pathOrRepo ) {

  const pr = when()

  // Already registered ?
  .then((pth) => {
    if (pth) return pth
    return getPath( pathOrRepo )
  })

  // Is a path or a repository
  .then((pth) => {
    if (pth) return pth

    return when.promise(function(resolve, reject) {
      npa2( pathOrRepo, function(err, npa2_result) {
        if (err) return reject( err )

        if (npa2_result.type.match(/^(local|directory)$/)) {
          try {
            fs.statSync( npa2_result.spec )
            resolve( npa2_result.spec )
          } catch(e) {
            reject(`"${npa2_result.spec}" does not exist.`)
          }
        }

        else if (npa2_result.type === 'hosted') {
          const hash            = toSlug( pathOrRepo )
          const repo            = npa2_result.hosted.ssh.split('#')
          const repo_url        = repo[0]
          const repo_committish = repo[1]

          pth = `${process.cwd()}/.tmp/${hash}`

          let promise = when()

          // Already cloned?
          try {
            fs.statSync( pth )
          } catch(e) {
            promise = promise.then(() => {
              return git.clone( repo_url, pth )
            })
          }

          if (repo_committish) {
            promise = promise.then(() => {
              return git.checkout( repo_committish, pth )
            })
          }

          promise.then(() => resolve( pth ))
        }
      })
    })
  })

  pr.then((pth) => {
    if (pth) registerPath( pth, pathOrRepo )
  })

  return pr

}

function getPath(key) {
  if (_sources[key]) {
    return key
  }

  for (const path in _sources) {
    if (_sources[path].indexOf(key) > -1) return path
  }

  return null
}

function registerPath( path, key ) {
  _sources[path] = _sources[path] || []
  if (_sources[path].indexOf(key) === -1) _sources[path].push( key )
}

module.exports = {
  resolve:      resolve,
  getPath:      getPath,
  registerPath: registerPath
}
