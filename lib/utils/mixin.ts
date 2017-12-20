export type MixinConstructor<T> = new(...args: any[]) => T

export class MixinBuilder<T> {

  constructor(private Base: T) {}

  with(...mixins: Function[]) {
    return mixins.reduce((c, mixin) => {
      return mixin(c)
    }, this.Base)
  }

}

export class MixinClass {}

export function Mixin<T>(Base: T) {
  return new MixinBuilder<T>(Base)
}