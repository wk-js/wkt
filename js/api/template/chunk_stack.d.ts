import { Order } from '../../stack/order';
export declare class ChunkStack extends Order {
    chunks: {
        [key: string]: string;
    };
    _addChunk(key: string, chunk: string): void;
    add(key: string, chunk?: string): void;
    before(bfore: string, key: string, chunk?: string): void;
    after(after: string, key: string, chunk?: string): void;
    get(key: string): string;
}
