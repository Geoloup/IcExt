// Built-in functions
export class Builtins {
  constructor() {
    this.functions = new Map();
    this.registerDefaults();
  }

  registerDefaults() {
    this.register('print', (...args) => `console.log(${args.join(', ')})`);
    this.register('error', (...args) => `console.error(${args.join(', ')})`);
    this.register('open', (...args) => ` new fileApi(${args[0]})`);
    this.register('extentionAPI', (...args) => `await IC(${args.join(',')})`);
    this.register('sleep', (...args) => `await delay(${args[0]})`);
    this.register('wait', (...args) => `await ${args.join(',')})`);
  }

  register(name, handler) {
    this.functions.set(name, handler);
  }

  get(name) {
    return this.functions.get(name);
  }

  has(name) {
    return this.functions.has(name);
  }
}
