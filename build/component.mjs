import { assert, copy } from './utils.mjs';

export default function({register}) {
  register('component', {
    extends: 'props events commands'
  });
}