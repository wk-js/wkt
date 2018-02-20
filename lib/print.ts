import { Print } from "wk-print/js/print";
import { TagExtension } from "wk-print/js/extensions/tag";

const _P = new Print

_P.config.extension(TagExtension)
_P.config.category({
  name: 'debug',
  visible: true,
  extensions: {
    style: { styles: ['grey'] },
    tag: { tag: 'wkt', styles: ['cyan'] }
  }
})

export const P = _P as any