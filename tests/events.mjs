import { register, create, test } from "./setup.mjs";
test("Events");

register('con',{
  extends: "events",
  public: {
    text: "",
    history: [],
    log(text) {
      this.public.text = text;
      this.trigger("log",{text});
    }
  },
  on: {
    log({text}) {
      this.public.history.push(text)
    }
  }
})

const con = create("con");
con.log("foo");
test(
  "event in typedef", con.history.length === 1 && con.history[0] === "foo"
)

const filtered1 = create("con",{
  before: {
    log({text}) {
      if (!text) return false;
    }
  },
});
filtered1.log("foo");
console.log("");
test(
  "event cancelled in args", filtered1.history.length === 1 && filtered1.history[0] === "foo"
)

register("con-filtered", {
  extends: "con",
  before: {
    log({text}) {
      if (!text) return false;
    }
  },
})

const filtered2 = create("con-filtered");
filtered2.log("foo");
filtered2.log("");
test(
  "event cancelled in typedef", filtered2.history.length === 1 && filtered2.history[0] === "foo"
)

register("con-limited",{
  extends: "con-filtered",
  after: {
    log() {
      this.public.history = this.public.history.slice(-this.limit)
    }
  },
  private: {
    limit: 3,
  },
  init ({limit=this.limit}) {
    this.limit = limit;
  }
})

const limited = create("con-limited",{limit:2});
limited.log("foo");
limited.log("foo");
limited.log("foo");
limited.log("foo");
test(
  "after event works", limited.history.length === 2
)


