// Scope management
export class Scope {
  constructor() {
    this.variables = new Map();
    this.currentScope = [];
  }

  declare(name, value, type) {
    this.variables.set(name, { value, type, scope: [...this.currentScope] });
  }

  get(name) {
    return this.variables.get(name);
  }

  enterScope() {
    this.currentScope.push({});
  }

  exitScope() {
    this.currentScope.pop();
  }

  clear() {
    this.variables.clear();
    this.currentScope = [];
  }

  getAllDeclarations() {
    return Array.from(this.variables.entries())
      .map(([name, { value, type }]) => `${type} ${name} = ${value};`)
      .join('\n  ');
  }
}
