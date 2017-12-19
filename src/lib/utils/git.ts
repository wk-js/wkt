import { spawn } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

function exec(command:string, options?:any) {
  return new Promise(function(resolve, reject) {
    options = Object.assign({
      stdio: 'inherit',
      encoding: 'utf-8',
      break: false
    }, options || {})

    const args = command.split(' ')
    const ps = spawn(args.shift() as string, args, options)

    let error:Error
    let exited = false

    function exit(code:number, signal:string | null) {
      if (exited) return
      exited = true

      if ((code != 0 || error) && options.break) {
        return reject({ code, signal, error })
      }

      resolve({ code, signal })
    }

    ps.on('error', function(err) {
      error = err
      exit(-1, null)
    })

    ps.on('exit', exit)
  })
}

export function clone(repo_url:string, to:string) {
  to = to || ''
  return exec(`git clone ${repo_url} ${to}`)
}

export function checkout(committish:string, to:string) {
  return exec(`git checkout ${committish}`, { cwd: to })
}

export function sparsecheckout(options:any) {
  return exec(`mkdir ${options.tmp}`)
  .then(() => exec(`git init`, { cwd: options.tmp }))
  .then(() => exec(`git remote add origin -f ${options.remote}`, { cwd: options.tmp }))
  .then(() => exec(`git config core.sparsecheckout true`, { cwd: options.tmp }))
  .then(() => fs.writeFileSync(path.join(options.tmp, '.git/info/sparse-checkout'), options.directory))
  .then(() => exec(`git pull origin master`, { cwd: options.tmp }))
}
