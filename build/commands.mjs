import { assert, copy } from './utils.mjs';

export default function ({ register }) {
  register('commands', {
    build: {
      commands: {
        install(dd) {
          dd.commands = {};
          Object.defineProperty(this.public, 'call', {
            value: (cmd, ...args) => {
              assert(dd.commands[cmd], "commands-bad-command", { cmd });
              return dd.commands[cmd].execute.call(this,...args);
            }
          })
        },
        build(def, dd) {
          for (var cmd in def) {
            let cmddef = def[cmd];
            if (typeof cmddef==='function') cmddef = { execute:cmddef };
            dd.commands[cmd] = cmddef;
          }
        },
      }
    }
  });

  register('proxy', {
    extends: 'commands',
    ecludes: 'component',
    build: {
      commands: {
        init(dd,{commands}={}) {
          for (var cmd in commands) {
            let cmddef = commands[cmd];
            if (typeof cmddef==='function') cmddef = { execute:cmddef };
            dd.commands[cmd] = cmddef;
          }
        }
      }
    }
  });

}
