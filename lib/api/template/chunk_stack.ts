import { Order } from '../../stack/order'

export class ChunkStack extends Order {

  chunks: { [key:string]: string } = {}

  _addChunk( key:string, chunk:string ) {
    this.chunks[key] = chunk || ''
  }

  add( key:string, chunk:string ) {
    super.add( key )
    this._addChunk( key, chunk )
  }

  before( bfore:string, key:string, chunk:string ) {
    super.before( bfore, key )
    this._addChunk( key, chunk )
  }

  after( after:string, key:string, chunk:string ) {
    super.after( after, key )
    this._addChunk( key, chunk )
  }

  get(key) {
    const regex = new RegExp(`^${key}`)

    return this.order

    .filter((k) => {
      return k.match(regex)
    })

    .map((k) => {
      return this.chunks[k]
    })

    .join('\n')
  }

}