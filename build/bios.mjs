import { Factory } from '@websh/factory';
import registerProps from './props.mjs';
import registerEvents from './events.mjs';
import registerCommands from './commands.mjs';
import registerComponent from './component.mjs';

export function Bios () {
  if (this instanceof Bios) {
    throw new Error('Illegal constructor. Use plain Bios(), not new Bios()');
  }

  const { register, create } = Factory();

  registerProps({ register, create });
  registerEvents({ register, create });
  registerCommands({ register, create });
  registerComponent({ register, create });

  return { register, create };
}

export * from './utils.mjs';
