import { Factory } from "@websh/factory";
import installProps from "./props.mjs";
import installEvents from "./events.mjs";


export function Bios() {
  if (this instanceof Bios) {
    throw "Illegal constructor. Use plain Bios(), not new Bios()";
  }

  const { register, create } = Factory();
  
  installProps({register,create});
  installEvents({register,create});
  
  return { register, create };
}

export * from "./utils.mjs";

//import "./src/events.mjs";
/*
import "./src/props-propagate.mjs";
import "./src/component.mjs";
*/
