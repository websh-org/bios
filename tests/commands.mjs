import { register, create, test } from './setup.mjs';
test('Commands');

register('remote',{
  extends: "commands",
  private: {
    channel:1,
  },
  commands: {
    inc() {
      this.channel ++;
    },
    dec() {
      this.channel --
    },
    get() {
      return this.channel;
    },
    proxy() {
      return create("proxy",{
        commands: {
          set: n => {
            this.channel = n;
          }
        }
      })
    }
  }
})

const remote = create("remote");

test(
  "command works", 1, 
  () => remote.call("get")
)


test(
  "bad command fails", 
  new Error("commands-bad-command"), 
  () => remote.call("foo")
)

const proxy = remote.call("proxy");
proxy.call("set",10);
test(
  "proxy command works", 10, 
  () => remote.call("get")
)

