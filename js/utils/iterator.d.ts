export interface Iterator<T> {
    next(value?: any): IteratorResult<T>;
    return?(value?: any): IteratorResult<T>;
    throw?(e?: any): IteratorResult<T>;
}
export interface Iterable<T> {
    [Symbol.iterator]: Iterator<T>;
}
export interface IteratorResult<T> {
    done: boolean;
    value: T;
}
