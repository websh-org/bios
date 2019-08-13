import { assert, copy } from './utils.mjs';
export default function events ({ register, create }) {
  const EVENTS = Symbol();

  function trigger (obj, event, ...args) {
    return (
      obj[EVENTS][event] &&
      obj[EVENTS][event].before.every(x => x(...args) !== false) &&
      (obj[EVENTS][event].on.forEach(x => x(...args)),
      obj[EVENTS][event].after.forEach(x => x(...args)))
    );
  }
  function addEventHandler (obj, event, when, handler) {
    if (!obj[EVENTS][event]) {
      obj[EVENTS][event] = { before: [], on: [], after: [] };
      // obj[event] = trigger.bind(obj, event);
    }
    obj[EVENTS][event][when] = obj[EVENTS][event][when].concat(handler);
  }

  register('events', {
    construct () {
      this[EVENTS] = {};
    },
    build: {
      before (def) {
        for (const event in def) {
          addEventHandler(this, event, 'before', def[event].bind(this));
        }
      },
      on (def) {
        for (const event in def) {
          addEventHandler(this, event, 'on', def[event].bind(this));
        }
      },
      after (def) {
        for (const event in def) {
          addEventHandler(this, event, 'after', def[event].bind(this));
        }
      }
    },
    private: {
      trigger (event, ...args) {
        trigger(this, event, ...args);
      }
    },
    init ({ before, on, after } = {}) {
      for (const event in before) {
        addEventHandler(this, event, 'before', before[event]);
      }
      for (const event in on) {
        addEventHandler(this, event, 'on', on[event]);
      }
      for (const event in after) {
        addEventHandler(this, event, 'after', after[event]);
      }
    }
  });
}
