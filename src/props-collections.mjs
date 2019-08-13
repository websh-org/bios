import { register } from "../bios.mjs";
import { assert, copy, uid } from "./utils.mjs";

register("props-collections", {
  build: {
    props: {
      build(def, dd, args = {}) {
        for (const prop in def) {
          const proto = dd.props[prop];
          const propdef = def[prop];
          if (propdef.collection==="map") {
            const map = new Map();
            this.props[prop] = {
              set(key, value) {
                return map.set(key,proto.set.call(this,value));
              },
              get(key,value)
            }
          }
          if (proto.arg && (prop in args)) this[prop] = copy(args[prop], this)
          else if ("value" in proto) this[prop] = copy(proto.value, this);
        }
      },
    }
  }
});
