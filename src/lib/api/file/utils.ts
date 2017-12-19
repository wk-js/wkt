import { createReadStream, createWriteStream, unlink, statSync, mkdir, mkdirSync, unlinkSync } from "fs";
import { promise, all, reduce } from "when";
import { FileList } from "filelist";
import { normalize, dirname } from "path";

export function isFile(path:string) {

  try {
    const stat = statSync( path )
    if (!stat.isFile()) throw 'Not a file'
  } catch(e) {
    return false
  }

  return true

}

export function isDirectory(path:string) {

  try {
    const stat = statSync( path )
    if (!stat.isDirectory()) throw 'Not a file'
  } catch(e) {
    return false
  }

  return true

}

export function copy(fromFile:string, toFile:string) {
  return promise(function(resolve, reject) {

    const fileValid = isFile(fromFile)
    if (!fileValid) throw 'Files not valid'

    ensureDir(dirname( toFile )).then(function() {
      const rs = createReadStream( fromFile )
      const ws = createWriteStream( toFile  )

      ws.on('error', reject)
      rs.on('error', reject)
      rs.on('end', resolve)

      rs.pipe( ws, { end: true })
    })

  })
}

export function remove(file:string) {
  return promise(function(resolve, reject) {

    if (!isFile(file)) throw 'Cannot be removed. This is not a file.'

    unlink(file, function(err) {
      if (err) {
        reject(err)
        return
      }

      resolve({})
    })

  })
}

export function move(fromFile:string, toFile:string) {
  return reduce([
    function() { return copy(fromFile, toFile) },
    function() { return remove(fromFile)       }
  ], function(res:null, action:Function) {
    return action()
  }, null)
}

export function rename(fromFile:string, toFile:string) {
  return move(fromFile, toFile)
}

export function ensureDir(path:string) {
  path = normalize(path)

  const dirs = path.split( '/' )

  return reduce(dirs, function(res:string, d:string) {
    if (d === '.') return res

    res += '/' + d

    if (!isDirectory(res)) {
      return promise(function(resolve, reject) {
        mkdir(res, function(err) {
          if (err) {
            reject(err)
            return
          }

          resolve(res)
        })
      })
    }

    return res
  }, '.')

}

export function fetch(include:string|string[], exclude?:string|string[]) {
  const FL = new FileList

  const includes = Array.isArray(include) ? include : [ include ]
  const excludes = Array.isArray(exclude) ? exclude : exclude ? [ exclude ] : []

  includes.forEach((inc) => FL.include( inc ))
  excludes.forEach((exc) => FL.exclude( exc ))

  const files = FL.toArray().filter(function(file:string) {
    return isFile( file )
  })

  return files
}