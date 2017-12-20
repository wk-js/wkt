import { Writable } from "stream";

const memStore : { [key: string]: Buffer } = {}

export class MemoryStream extends Writable {

  constructor(public key:string) {
    super()
    memStore[key] = new Buffer('')
  }

  _write(chunk:Buffer | any, enc:string, cb:Function) {
    const bf = Buffer.isBuffer(chunk) ? chunk : new Buffer(chunk)
    memStore[this.key] = Buffer.concat([ memStore[this.key], bf ])
    cb()
  }

  getData(encoding?:string) : string | Buffer {
    return encoding ? memStore[this.key].toString(encoding) : memStore[this.key]
  }

  clean() {
    delete memStore[this.key]
  }

}