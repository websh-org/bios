import { register, create, test } from "./setup.mjs";

test("Props");

register("hello", {
  extends: 'props',
  props: {
    greeting: {
      value: "Hello",
    },
    name: {
      arg: true,
      public: true,
      value: "world",
      writable: true,
    },
    readonly: {
      public: true,
      value: true
    },
    greet: {
      public: true,
      value() {
        return `${this.greeting}, ${this.name}!`
      }
    }
  }
})

const world = create("hello");
test(
  "public prop default", "world",
  world.name
)

test(
  "public method", "Hello, world!",
  world.greet()
)

test(
  "private prop", new Error("prop-not-readable"),
  () => world.greeting
)

test(
  "readonly prop", new Error("prop-not-writable"),
  () => world.readonly = "cannot change"
)


const aunty = create("hello", { name: "Aunty" });

test("prop from arg", "Aunty", aunty.name)
test(
  "public prop", "Uncle",
  () => aunty.name = "Uncle"
)


register("hi", {
  extends: "hello",
  props: {
    greeting: {
      value: "Hi"
    }
  }
})

const mom = create('hi', { name: "Mom" })
test("override prop value", "Hi, Mom!", mom.greet())

register("ask", {
  extends: "hello",
  props: {
    ask: {
      public: true,
      value(question) {
        return `Hey ${this.public.name}, ${question}?`;
      }
    }
  }
})

const buddy = create('ask', { name: "Buddy" })
test("Add method ask", "Hey Buddy, what's up?", buddy.ask("what's up"));

register("greeting", {
  extends: "hello",
  props: {
    greeting: {
      arg: true
    }
  }
})

const kiddo = create('greeting', {
  greeting: "Hey",
  name: "Kiddo"
})
test(
  "Set name from argument", "Hey, Kiddo!",
  kiddo.greet()
)


// Creating components with multiple types
const mister = create("greeting ask", {
  greeting: "Good day",
  name: "Mister",
})
test(
  "Method from first type", "Good day, Mister!",
  mister.greet()
)
test(
  "Method from second type", "Hey Mister, who do you think you are?",
  mister.ask("who do you think you are")
)


register("person", {
  extends: "greeting ask",
  props: {
    warn: {
      public: true,
      value(about) {
        return `Watch out for ${about}, ${this.public.name}!`;
      }
    }
  },
});

const doc = create('person', { greeting: "What's up", name: "Doc" });
test(
  "Method from first inherited type", "What's up, Doc!",
  doc.greet()
);
test(
  "Method from second inherited type", "Hey Doc, what's cooking?",
  doc.ask("what's cooking")
);

test(
  "Method from derived type",
  "Watch out for the dog, Doc!",
  doc.warn("the dog")
);


register("dear", {
  extends: "props",
  props: {
    name: {
      get: name => {
        return "dear " + name
      }
    },
    greeting: {
      arg: true,
      set: value => (
        String(value).substr(0, 1).toUpperCase() + String(value).substr(1)
      )
    }
  }
})

const mother = create('dear person', { name: "Mother" })
test("Prop getter", "Hello, dear Mother!", mother.greet)

const father = create('person dear', { greeting: "greetings", name: "Father" });
test("Prop setter", "Greetings, dear Father!", father.greet());

register("my-dear", {
  installs: "dear",
  props: {
    name: {
      get: name => {
        return "my " + name
      }
    },
    greeting: {
      arg: true,
      set: value => value + " to you"
    }
  }
})

const alice = create('my-dear person', { greeting: "good morning", name: "Alice" });
test("Inherited setter and getter", "Good morning to you, my dear Alice!", alice.greet());
