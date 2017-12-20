import { EventEmitter } from 'events'
import * as path from 'path'
import { Stats } from 'fs'
import * as fs from 'fs-extra'
import * as ejs from 'lodash.template'

export class Renderer extends EventEmitter {

  ejs = ejs
  options: any         = {}
  data: any            = {}
  includes: string[]   = []
  enableWatch: boolean = false

  /**
   * Create a new template
   *
   * @param {String} input - Path the input file
   * @param {String} ouput - Path the output file
   */
  constructor(public input:string, public output:string) {
    super()

    this.include = this.include.bind(this)
    this.require = this.require.bind(this)
  }

  /**
   * Render
   */
  render() {

    if (!this.options.filename) {
      this.options.filename = path.resolve(this.input)
    }

    this.emit('start')

    fs.ensureDirSync( path.dirname(this.output) )

    const rs = fs.createReadStream(this.input)
    const ws = fs.createWriteStream(this.output)

    rs.on('data', ( chunk:string | Buffer ) => {
      chunk = Buffer.isBuffer(chunk) ? chunk.toString('utf8') : chunk
      ws.write( this.renderSource(chunk) )
    })

    rs.on('end', () => {
      ws.end()

      this.emit('end')
    })

  }

  include(pth:string) {
    if (this.includes.indexOf(pth) === -1) {
      this.includes.push(pth)
      // if (this.enableWatch) this.watch(pth, this.options.filename)
    }
    return Renderer.include(pth, this.options)
  }

  require(pth:string) {
    return Renderer.require(pth, this.options)
  }

  watch(child:string, parent:string) {
    fs.watchFile(child, { interval: 300 }, (curr:Stats, prev:Stats) => {
      if (curr.mtime > prev.mtime) {
        fs.open(parent, 0, function(err:Error, fd:number) {
          if (err) return console.log(err)

          fs.fstat(fd, function(err:Error) {
            if (err) return console.log(err)
            const now = Date.now()

            const a = parseInt((now / 1000) + '', 10)
                , m = parseInt((now / 1000) + '', 10)

            fs.futimes(fd, a, m, function(err:Error) {
              if (err) return console.log(err)
              fs.close(fd)
            })
          })
        })
      }
    })
  }

  /**
   * Render a source
   *
   * @param {String} src
   */
  renderSource( src:string ) {
    // Force defaults
    this.data.include = this.include
    this.data.require = this.require
    this.options.interpolate = /<%=([\s\S]+?)%>/g

    return Renderer.render( src, this.options, this.data )
  }

  /**
   * Render
   *
   * @param {String} src
   * @param {Object} options
   * @param {Object} data
   */
  static render = function(src:string, options:any, data?:any) {
    return ejs(src, options)(data)
  }

  static include = function(pth:string, options:any, data?:any) {
    pth = path.resolve(path.dirname(options.filename), pth)
    pth = path.relative(process.cwd(), pth)
    const src = fs.readFileSync(pth, 'utf-8')
    return Renderer.render(src, options, data)
  }

  static require = function(pth:string, options:any) {
    pth = path.resolve(path.dirname(options.filename), pth)
    return require(pth)
  }

}
