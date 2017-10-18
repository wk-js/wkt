'use strict'

const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

function exec(command, options) {
  return new Promise(function(resolve, reject) {
    options = Object.assign({
      stdio: 'inherit',
      encoding: 'utf-8',
      break: false
    }, options || {})

    const args = command.split(' ')
    const ps = spawn(args.shift(), args, options)

    let error
    let exited = false

    function exit(code, signal) {
      if (exited) return
      exited = true

      if ((code != 0 || error) && options.break) {
        return reject({ code, signal, error })
      }

      resolve({ code, signal })
    }

    ps.on('error', function(err) {
      error = err
      exit()
    })

    ps.on('exit', exit)
  })
}

function clone(repo_url, to) {
  to = to || ''
  return exec(`git clone ${repo_url} ${to}`)
}

function checkout(committish) {
  return exec(`git checkout ${committish}`)
}

function sparsecheckout(options) {
  return exec(`mkdir ${options.tmp}`)
  .then(() => exec(`git init`, { cwd: options.tmp }))
  .then(() => exec(`git remote add origin -f ${options.remote}`, { cwd: options.tmp }))
  .then(() => exec(`git config core.sparsecheckout true`, { cwd: options.tmp }))
  .then(() => fs.writeFileSync(path.join(options.tmp, '.git/info/sparse-checkout'), options.directory))
  .then(() => exec(`git pull origin master`, { cwd: options.tmp }))
}

module.exports = {
  clone,
  checkout,
  sparsecheckout
}