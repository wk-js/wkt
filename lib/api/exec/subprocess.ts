import { bind } from 'lol/utils/function'
import { pick, omit } from 'lol/utils/object'
import { spawn, ChildProcess, spawnSync, SpawnSyncReturns } from 'child_process';
import { MemoryStream } from '../../utils/memory-stream';
import * as when from 'when'

let ID:number = 0

function NOOP() {}

enum SubprocessStatuses {
  PENDING = "pending",
  PROCESSING = "processing",
  FAILED = "failed",
  COMPLETE = "complete"
}

export class Subprocess {

  id:number = ID++

  ps: ChildProcess | null = null

  stdoutStream: MemoryStream | undefined
  stderrStream: MemoryStream | undefined

  promise: any
  streamPromise: any

  resolve: Function = NOOP
  reject:  Function = NOOP

  status:string = SubprocessStatuses.PENDING

  processOptions:any

  constructor(public command:string, public options?:any) {
    bind(this, 'execute', '_onError', '_onExit', '_onStdOutData', '_onStdErrData')

    options = options || {}

    this.options = {
      interactive: true,
      printStdout: true,
      printStderr: true,
      rejectOnError: false,
      async: true
    }

    const okeys = Object.keys(this.options)

    Object.assign(
      this.options,
      pick( options, okeys )
    )

    this.processOptions = omit( options, okeys )

    if (this.options.async) this.prepare()
  }

  prepare() {
    this.promise = when.promise((resolve:Function, reject:Function) => {
      this.resolve = resolve
      this.reject  = reject

      this.stdoutStream = new MemoryStream(`stdout_${this.id}`)
      this.stderrStream = new MemoryStream(`stderr_${this.id}`)

      this.streamPromise = when.all([
        when.promise((resolve:any) => { (this.stdoutStream as MemoryStream).on('finish', resolve) }),
        when.promise((resolve:any) => { (this.stderrStream as MemoryStream).on('finish', resolve) })
      ])
    })
  }

  execute() {
    return (this.options.async) ? this.executeAsync() : this.executeSync()
  }

  executeSync() {
    if (this.status !== SubprocessStatuses.PENDING) return;
    this.status = SubprocessStatuses.PROCESSING

    const opts = {
      env: this.options.env || {},
      stdio: 'pipe',
      encoding: 'utf-8'
    }
    opts.env = Object.assign(opts.env, process.env)

    if (this.options.use_color) {
      opts.env.FORCE_COLOR = true
    }

    if (this.options.interactive) {
      opts.stdio = 'inherit'
    }

    Object.assign(opts, this.processOptions)

    const cli = this.command.split(' ')

    return spawnSync(cli.shift() as string, cli, opts) as SpawnSyncReturns<string> | SpawnSyncReturns<Buffer>
  }

  executeAsync() {
    if (this.status !== SubprocessStatuses.PENDING) return;
    this.status = SubprocessStatuses.PROCESSING

    const opts = { env: this.options.env || {}, stdio: 'pipe' }
    opts.env = Object.assign(opts.env, process.env)

    if (this.options.use_color) {
      opts.env.FORCE_COLOR = true
    }

    if (this.options.interactive) {
      opts.stdio = 'inherit'
    }

    Object.assign(opts, this.processOptions)

    const cli = this.command.split(' ')

    this.ps = spawn(cli.shift() as string, cli, opts)
    this.activate()

    return this.promise
  }

  kill() {
    if (this.ps) this.ps.kill()
  }

  activate() {
    if (!this.ps) return

    const ps = this.ps

    ps.on( 'error', this._onError )
    ps.on( 'exit' , this._onExit  )

    if (ps.stdout) {
      ps.stdout.pipe(this.stdoutStream as MemoryStream)
      ps.stdout.on('data', this._onStdOutData)
    }

    if (ps.stderr) {
      ps.stderr.pipe(this.stderrStream as MemoryStream)
      ps.stderr.on('data', this._onStdErrData)
    }
  }

  desactivate() {
    if (!this.ps) return

    const ps = this.ps

    ps.removeListener( 'error', this._onError )
    ps.removeListener( 'exit' , this._onExit  )

    if (ps.stdout) {
      ps.stdout.unpipe(this.stdoutStream as MemoryStream)
      ps.stdout.removeListener( 'data', this._onStdOutData )
    }

    if (ps.stderr) {
      ps.stderr.unpipe(this.stderrStream as MemoryStream)
      ps.stderr.removeListener( 'data', this._onStdErrData )
    }
  }

  _onStdOutData(data:Buffer) {
    if (this.options.printStdout) {
      console.log(data.toString('utf-8'))
    }
  }

  _onStdErrData(data:Buffer) {
    if (this.options.printStderr) {
      console.log(data.toString('utf-8'))
    }
  }

  private _onError(value:any) {
    if (this.status !== SubprocessStatuses.PROCESSING) return;

    let err
    if (value) {
      if (value instanceof Error) err = value
      else if ( typeof value === 'string' ) err = new Error( value )
      else err = new Error( value.toString() )
    } else {
      err = new Error()
    }

    this.kill()
  }

  private _onExit(code:number, signal:string, err:any) {
    if (this.status !== SubprocessStatuses.PROCESSING) return;

    const scope        = this
    const ps           = this.ps as ChildProcess
    const stdoutStream = this.stdoutStream as MemoryStream
    const stderrStream = this.stderrStream as MemoryStream
    const options      = this.options
    const resolve      = this.resolve
    const reject       = this.reject

    const response: any = {
      code: code,
      stdout: undefined,
      stderr: undefined,
      err: err
    }

    function finish(result:any) {
      if ((err || code !== 0) && options.rejectOnError) {
        scope.status = SubprocessStatuses.FAILED
        console.log('Unexpected exit with code:', code)
        reject(result)
      } else {
        scope.status = SubprocessStatuses.COMPLETE
        resolve(result)
      }
    }

    if (ps.stdout || ps.stderr) {
      // Wait stream finished
      scope.streamPromise.then(() => {
        response.stdout = stdoutStream.getData(options.encoding)
        response.stderr = stderrStream.getData(options.encoding)
        finish.call(null, response)
      })

      return
    }

    finish.call(null, response)
  }

  static create(command:string, options?:any) {
    return new Subprocess(command, options)
  }

  static execute(command:string, options?:any) {
    const sub = new Subprocess(command, options)
    return sub.execute()
  }

}