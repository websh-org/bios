import { assert, copy } from "./utils.mjs";

export default function props({register,create}) {
  register("props", {
    build: {
      props: {
        init(dd, args = {}) {
          for (const prop in dd.props) {
            const proto = dd.props[prop]
            if (proto.arg && (prop in args)) this[prop] = copy(args[prop], this)
            else if ("value" in proto) this[prop] = copy(proto.value, this);
          }
        },
        install(dd) {
          this.props = {}
          dd.props = {};
        },
        build(def, dd) {
          const protos = dd.props;
          const stored = this.props;
          for (const prop in def) {
            let proto = protos[prop];
            const propdef = def[prop];

            if (!proto) {
              // declare new property
              proto = protos[prop] = {};
              proto.set = value => value;
              proto.get = value => value;
              proto.changed = (newValue,oldValue) => {}
              
              Object.defineProperty(this.public, prop, {
                set: value => {
                  assert(proto.public && proto.writable, "prop-not-writable", { prop });
                  this[prop] = value;
                },
                get: () => {
                  assert(proto.public && proto.readable !== false, "prop-not-readable", { prop });
                  return this[prop];
                },
              });
              Object.defineProperty(this, prop, {
                set: value => {
                  const oldValue = this[prop];
                  stored[prop] = proto.set.call(this, value)
                  const newValue = this[prop];
                  if (proto.changed && newValue !== oldValue ) {
                    proto.changed.call(this,newValue,oldValue)
                  }
                },
                get: () => proto.get.call(this, stored[prop])
              });
            }
            // finished declaring new property
            if (propdef.set) {
              let currentSetter = proto.set;
              let newSetter = propdef.set.bind(this);
              proto.set = value => currentSetter(newSetter(value));
            }
            if (propdef.get) {
              let currentGetter = proto.get;
              let newGetter = propdef.get.bind(this);
              proto.get = value => newGetter(currentGetter(value));
            }
            if (propdef.changed) {
              let currentChanged = proto.get;
              let newChanged = propdef.changed.bind(this);
              proto.changed = (newValue,oldValue) => {
                currentChanged(newValue,oldValue);
                newChanged(newValue,oldValue);
              }
            }
            for (const p of ["value","arg","public","writable"]) {
              if (p in propdef) proto[p] = propdef[p];
            }
          }
        }
      }
    }
  });
}