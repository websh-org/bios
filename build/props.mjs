import { assert, copy } from './utils.mjs';

export class Prop {
  static install (obj, dd) {
    dd.props = {};
  }

  static init (obj, dd, args) {
    for (const prop in dd.props) {
      const proto = dd.props[prop];
      if (proto.arg && (prop in args)) obj[prop] = copy(args[prop], obj);
      else if ('value' in proto) obj[prop] = copy(proto.value, obj);
    }
  }

  static build (obj, prop, def, dd) {
    if (dd.props[prop]) {
      dd.props[prop].override(def);
    } else {
      dd.props[prop] = new this(obj, prop, def);
    }
  }

  constructor (obj, prop, {
    set = value => value,
    get = value => value,
    changed = null,
    value = undefined,
    arg = false,
    public: _public = false,
    writable = false
  }) {
    Object.assign(this, {
      obj, prop, set, get, changed, value, arg, public: _public, writable
    });
    this.setup();
  }

  override ({ set, get, changed, ...rest }) {
    if (set) {
      const currentSetter = this.set;
      const newSetter = set.bind(this.obj);
      this.set = value => currentSetter(newSetter(value));
    }
    if (get) {
      const currentGetter = this.get;
      const newGetter = get.bind(this.obj);
      this.get = value => newGetter(currentGetter(value));
    }
    if (changed) {
      const currentChanged = this.changed;
      const newChanged = changed.bind(this.obj);
      if (currentChanged) {
        this.changed = (newValue, oldValue) => {
          currentChanged(newValue, oldValue);
          newChanged(newValue, oldValue);
        };
      } else {
        this.changed = newChanged;
      }
    }
    for (const p of ['value', 'arg', 'public', 'writable']) {
      if (p in rest) this[p] = rest[p];
    }
  }

  setter (value) {
    const oldValue = this.obj[this.prop];
    this.stored = this.set.call(this.obj, value);
    const newValue = this.obj[this.prop];
    if (this.changed && newValue !== oldValue) {
      this.changed.call(this.obj, newValue, oldValue);
    }
  }

  getter () {
    return this.get.call(this.obj, this.stored);
  }

  setup () {
    const { obj, prop } = this;

    this.stored = undefined;

    Object.defineProperty(obj, prop, {
      set: value => this.setter(value),
      get: value => this.getter(value)
    });

    Object.defineProperty(obj.public, prop, {
      set: value => {
        assert(this.public && this.writable, 'prop-not-writable', { prop });
        obj[prop] = value;
      },
      get: () => {
        assert(this.public && this.readable !== false, 'prop-not-readable', { prop });
        return obj[prop];
      }
    });
  }
}

export default function props ({ register, create }) {
  register('props', {
    build: {
      props: {
        init (dd, args = {}) {
          Prop.init(this, dd, args);
        },
        install (dd) {
          Prop.install(this, dd);
        },
        build (def, dd) {
          for (const prop in def) {
            Prop.build(this, prop, def[prop], dd);
          }
        }
      }
    }
  });
}
