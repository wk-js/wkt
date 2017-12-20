export declare type MixinConstructor<T> = new (...args: any[]) => T;
export declare class MixinBuilder<T> {
    private Base;
    constructor(Base: T);
    with(...mixins: Function[]): any;
}
export declare class MixinClass {
}
export declare function Mixin<T>(Base: T): MixinBuilder<T>;
