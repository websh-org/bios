import { register, create } from '@websh/factory';
import { assert, copy } from './utils.mjs';

register('props-propagate', {
  extends: 'props events',
  build: {
    props: {
      build (def, dd) {
        for (const prop in def) {
          if (def[prop].propagate) {
            const currentSetter = dd.props[prop].set;
            dd.props[prop].set = value => {
              currentSetter(value);
              setTimeout(() => {
                this.trigger('prop-change', {
                  path: [prop],
                  value: this.props[prop]
                });
              }, 0);
            };
          }
        }
      }
    }
  }
});

const CHILD = Symbol();
const CHILDREN = Symbol();

register('props-propagate-parent', {
  extends: 'props-propagate',
  construct () {
    CHILD.set(this, {});
    CHILDREN.set(this, {});
  },
  build: {
    child (def) {
      Object.assign(CHILD.get(this), copy(def));
    },
    children (def) {
      Object.assign(CHILDREN.get(this), copy(def));
    }
  },
  init () {
    for (const c in CHILDREN.get(this)) {
      this[c] = {};
    }
  },
  private: {
    createChild (c, { on, ...args }) {
      if (CHILD.get(this)[c]) {
        this[c] = create(['props-propagate', CHILD.get(this)[c]], {
          ...args,
          on: {
            ...on,
            'prop-change': ({ path, value }) => {
              this.trigger('prop-change', {
                path: [c, ...path],
                value: copy(value)
              });
            }
          }
        });
      } else if (this[CHILDREN[c]]) {
        const child = create(['props-propagate', CHILD.get(this)[c]], ...args, {
          on: {
            'prop-change': ({ path, value }) => {
              this.trigger('prop-change', {
                path: [c, child.id, ...path],
                value: copy(value)
              });
            }
          }
        });
        CHILDREN.get(this)[c][child.id] = child;
      } else {
        assert(false, 'bad-child-name');
      }
    }
  },
  removeChild (c, id) {
    if (CHILD.get(this)[c]) {
      delete this[c];
    } else if (this[CHILDREN[c]]) {
      delete CHILDREN.get(this)[c][id];
    } else {
      assert(false, 'bad-child-name');
    }
  }
});

register('props-propagate-root', {
  extends: 'props-propagate-parent',
  props: {
    children: {
      default: {}
    }
  },
  after: {
    'prop-change' ({ path, value }) {
      path = [].concat(path);
      var cur = this.children;
      var prop = path.pop();
      while (path.length) {
        const part = path.shift();
        if (!cur[part]) {
          cur[part] = {};
        }
        cur = cur[part];
      }
      cur[prop] = value;
    }
  }
});
