import { register } from "@websh/factory";
import { assert, copy } from "./utils.mjs";

register('component',{
  extends: "props-propagate"
})

register('component-parent',{
  extends: "props-propagate-parent"
})

register('component-root',{
  extends: "props-propagate-root"
})