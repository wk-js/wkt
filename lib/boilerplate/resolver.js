'use strict'

const when       = require('when')
const fs         = require('fs')
const { toSlug } = require('lol/utils/string')
const npa2       = require('realize-package-specifier')
const git        = require('../git')
const Sources    = require('./sources')

function resolve( pathOrRepo ) {

  const pr = when()

  // Already registered ?
  .then((pth) => {
    if (pth) return pth
    return Sources.get( pathOrRepo )
  })

  // Is a path or a repository
  .then((pth) => {
    if (pth) return pth

    return when.promise(function(resolve, reject) {
      npa2( pathOrRepo, function(err, npa2_result) {
        if (err) return reject( err )

        if (npa2_result.type.match(/^(local|directory)$/)) {
          resolve( npa2_result.spec )
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
    if (pth) Sources.register( pth, pathOrRepo )
  })

  return pr

}

module.exports = {
  resolve: resolve,
  Sources: Sources,
}
