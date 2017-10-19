'use strict'

const when          = require('when')
const path          = require('path')
const fs            = require('fs')
const { spawnSync } = require('child_process')
const { toSlug }    = require('lol/utils/string')
const npa           = require('npm-package-arg')
const npa2          = require('realize-package-specifier')

module.exports = function( pathOrRepo ) {

    //  Is a directory path
    const promise = when.promise(function(resolve) {
      fs.stat( path.resolve(pathOrRepo), function(err) {
        if (err) return resolve(null)
        resolve( path.resolve(pathOrRepo) )
      })
    })

    // Is a git repository
    .then((pth) => {
      if (pth) return pth

      return when.promise(function(resolve, reject) {
        const res = npa.resolve('lol', pathOrRepo)

        npa2(pathOrRepo, function(error, result) {
          if (error) {
            return reject(error)
          }

          const hash = toSlug( pathOrRepo )
          pth = `${process.cwd()}/.tmp/${hash}`
          const repo_url = result.hosted.ssh.replace('#' + res.hosted.committish, '')

          let ps = spawnSync('git', [ `clone ${repo_url} .tmp/${hash}` ], { shell: true, encoding: 'utf-8' })

          if (res.hosted.committish) {
            ps = spawnSync('git', [ `checkout ${res.hosted.committish}` ], { shell: true, encoding: 'utf-8', cwd: `.tmp/${hash}` })
          }

          if (ps.error || ps.status != 0) {
            return reject(ps)
          }

          resolve( pth )
        })
      })
    })

    promise.catch((err) => {
      console.log(err)
    })

    return promise
  }
