import { Order } from '../../stack/order'

export class ChunkStack extends Order {

  chunks: { [key:string]: string } = {}

  _addChunk( key:string, chunk:string ) {
    this.chunks[key] = chunk || ''
  }

  add( key:string, chunk?:string ) : void
  add( key:string, chunk:string )  : void {
    super.add( key )
    this._addChunk( key, chunk )
  }

  before( bfore:string, key:string, chunk?:string ) : void;
  before( bfore:string, key:string, chunk:string )  : void{
    super.before( bfore, key )
    this._addChunk( key, chunk )
  }


  after( after:string, key:string, chunk?:string ) : void;
  after( after:string, key:string, chunk:string ) : void {
    super.after( after, key )
    this._addChunk( key, chunk )
  }

  get(key:string) {
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