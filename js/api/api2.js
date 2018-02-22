"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const vue_1 = __importDefault(require("vue"));
function NOOP() { return {}; }
const APIDefaults = {
    computed: {},
    methods: {},
    data: NOOP,
    helpers: NOOP,
    init: NOOP,
    bundle: NOOP
};
// export class API<Data = object, Methods = object, Computed = object> {
//   boilerplate?: Boilerplate
//   constructor(options?:ThisTypedAPIOptions<API, Data, Methods, Computed>) {
//     if (options) {
//       // Init data
//       const data = options.data as Data
//       if (typeof data === 'function') {
//         merge( this, (<Function>data).call(this) )
//       } else if (typeof data === 'object' && !Array.isArray(data)) {
//         merge( this, data )
//       }
//       // Init methods
//       const methods = options.methods as Methods
//       for (const keyMethod in methods) {
//         (<any>this)[keyMethod] = (<any>methods)[keyMethod].bind(this)
//       }
//       // Init helpers
//       const helpers = options.helpers as () => APIHelpers<API>
//       (<any>this)['helpers'] = helpers.bind(this)
//       // Init computed
//       const computed = options.computed as Accessors<Computed>
//       for (const keyComputed in methods) {
//         let get, set
//         if (typeof methods[keyComputed] === 'function') {
//           get = methods[keyComputed]
//         } else if (typeof methods[keyComputed] === 'object') {
//           get = (<any>methods[keyComputed]).get
//           set = (<any>methods[keyComputed]).set
//         }
//         Object.defineProperty(this, keyComputed, {
//           get: get,
//           set: set
//         })
//       }
//     }
//   }
//   store(key:string, value?:any) {
//     return (<Boilerplate>this.boilerplate).store(key, value)
//   }
//   shared_store(key:string, value?:any) {
//     return (<Boilerplate>this.boilerplate).root.store(key, value)
//   }
//   static create<Data = object, Methods = object, Computed = object>(options?:ThisTypedAPIOptions<API, Data, Methods, Computed>) : CombinedAPIInstance<API, Data, Methods, Computed> {
//     options = Object.assign({}, APIDefaults, options || {})
//     const ctor = API as APIConstructor
//     return new ctor(options)
//   }
// }
class API {
    store(key, value) {
        return this.boilerplate.store(key, value);
    }
    shared_store(key, value) {
        return this.boilerplate.root.store(key, value);
    }
    static create(options) {
        const ctor = API;
        return new ctor(options);
    }
}
exports.API = API;
const c = API.create({
    computed: {
        data() {
            return this.shared_store('file:data') ?
                this.shared_store('file:data') :
                this.shared_store('file:data', {});
        },
        assets() {
            return this.shared_store('file:assets') ?
                this.shared_store('file:assets') :
                this.shared_store('file:assets', []);
        },
        chunk_stack() {
            return this.shared_store('file:chunk') ?
                this.shared_store('file:chunk') :
                this.shared_store('file:chunk', new Buffer(''));
        },
        asset() {
            if (this.store('file:current_asset')) {
                return this.store('file:current_asset');
            }
            const asset = '';
            this.store('file:current_asset', asset);
            this.assets.push(asset);
            return asset;
        }
    },
    methods: {
        message() {
            this.assets;
        }
    }
});
const v = new vue_1.default({
    computed: {
        hello() {
            return 'lol';
        }
    },
    methods: {
        message() {
            this.hello;
        }
    }
});
