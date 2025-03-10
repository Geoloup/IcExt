import { ErrCheck } from './error.js';

// Code parsing
export class Parser {
  static parseLine(
    line,
    scope,
    builtins,
    compiler,
    lineNum,
    mod = false,
    modName = '',
    noEnd = false,
    moduleList = []
  ) {
    line = line.trim();
    line = line.replaceAll(/\u200B/g, '');
    if (!line) return null;
    var erros = ErrCheck(line,lineNum,modName);
    if (erros) {
      return false;
    }
    // Variable declaration
    if (
      (line.startsWith('var ') || line.startsWith('let ')) &&
      line.indexOf('(') != -1
    ) {
      const [declaration, value] = line.split('=').map((part) => part.trim());
      const varName = declaration.replace('var', '').trim();
      const type = declaration.replace(varName, '').trim();
      try {
        var parsed = this.parseLine(
          value,
          scope,
          builtins,
          compiler,
          mod,
          modName,
          true
        );
        if (parsed.endsWith(';')) {
          var parsed = parsed.slice(0, parsed.length - 1);
        }
        scope.declare(varName, parsed, type);
        return `${declaration} = ${parsed}`;
      } catch (err) {
        scope.declare(varName, value, type);
        console.warn(err.message);
        // also add var to the result code for runtime
        return `${declaration} = ${value}`;
      }
    }

    // import modules
    if (line.startsWith('import ')) {
      var file = line.replace('import ', '') + '.ihat'; // file to import
      var moduleName = line.replace('import ', ''); // name for the module
      if (
        modName != moduleName &&
        !moduleList.some((item) => moduleName == item)
      ) {
        moduleList.push(moduleName);
        return new compiler().compileModule(
          window.fs.read(file),
          moduleName,
          moduleList
        );
      }
      return '';
    }

    // Comments
    if (line.startsWith('//')) return line;

    // Function declaration
    if (line.startsWith('func ') && !mod) {
      scope.enterScope();
      return line.replace('func ', 'function ');
    }
    if (line.startsWith('thread func ') && !mod) {
      scope.enterScope();
      return line.replace('thread func ', 'async function ');
    }

    // remove dangerous code like eval
    const dangerous = ['eval', 'document.write', 'fetch'];
    if (dangerous.some((item) => line.startsWith(item))) {
      return '// dangerous code removed'; // replace the line
    }

    // Function declaration for module
    if (line.startsWith('func ') && mod) {
      scope.enterScope();
      const functionRegex = /^func\s(\w+)\(([0-9a-zA-Z,'"]*)\)/;
      return line.replace(functionRegex, `${modName}.$1 = function ($2)`);
    }
    if (line.startsWith('thread func ') && mod) {
      scope.enterScope();
      const functionRegex = /^thread func\s(\w+)\(([0-9a-zA-Z,'"]*)\)/;
      return line.replace(functionRegex, `${modName}.$1 = async function ($2)`);
    }

    // class renaming
    if (line.startsWith('class ') && mod) {
      scope.enterScope();
      const functionRegex = /class\s(\w+)/;
      return line.replace(functionRegex, `${modName}.$1 = class`);
    }

    // Preimport local file when read ask
    if (line.startsWith('openLocal')) {
      var openRegex = /openLocal\(["-']([A-z.]+)["-']\)/g;

      var file = line.replace(openRegex, `$1`);
      var openFile = window.fs.read(file);
      var fakefile = { content: openFile };
      var serialed = JSON.stringify(fakefile);
      var serialed = serialed.slice(
        serialed.indexOf(':') + 1,
        serialed.length - 1
      );
      return `new fileApi('localFile-${file}').writeReturn(${serialed})`;
    }

    // Extension declaration
    if (line.startsWith('extension ')) {
      return `// Extension: ${line.slice(10)}`;
    }

    if (line.startsWith('while ')) {
      var customName = 'wh' + crypto.randomUUID().replaceAll('-', '');
      if (scope.get(customName)) {
        var customName = 's' + crypto.randomUUID().replaceAll('-', '');
      }
      return `var ${customName} = 0;\nwhile (${customName} < 120) {\n    ${customName}++;`;
    }

    if (line.startsWith('function ')) {
      return `${line} /* we recommand using func instead but not in class*/`;
    }

    const moduleFunc = /([.\w]+)\s*(\([^\)\n]*\))[\s;]*$/gm;
    if (moduleFunc.test(line) && mod && line.startsWith('wait')) {
      // $1 before () $2 (with parms)
      return line
        .replace('wait', 'await')
        .replace(moduleFunc, `${modName}.$1$2`);
    }

    // Built-in function calls
    for (const [name, handler] of builtins.functions) {
      if (line.startsWith(name)) {
        var sline = line.slice(line.indexOf('('), line.indexOf(')') + 1);
        if (moduleFunc.test(sline) && mod) {
          // $1 before () $2 (with parms)
          var line = sline.replace(moduleFunc, `${modName}.$1$2`);
        }
        var args = line.slice(name.length).trim();
        const argsSlice = line
          .slice(name.length)
          .substr(1, line.slice(name.length).length - 2)
          .split(',');
        var argsAdd = [];
        argsSlice.forEach((arg) => {
          if (arg.startsWith('(')) {
            arg = arg.replace('(', '');
          }
          if (
            arg.replaceAll(' ', '').startsWith('"') ||
            arg.replaceAll(' ', '').startsWith("'")
          ) {
            // is a "direct" variable
            argsAdd.push(arg);
          } else if (arg != '') {
            // is a object not a direct variable need to fill it in direcly with it
            /*argsAdd.push(scope.get(arg).value);*/
            argsAdd.push(arg);
          }
        });
        var args = line.slice(0, name.Lenght + 1) + argsAdd.join(',');
        try {
          return handler(`${args}`) + ';';
        } catch (error) {
          return `//Invalid arguments for ${name}: ${error.message}`;
        }
      }
    }
    if (moduleFunc.test(line) && mod) {
      // $1 before () $2 (with parms)
      return line.replace(moduleFunc, `${modName}.$1$2`);
    }

    // Handle scope exit
    if (line === '}') {
      scope.exitScope();
      return '}\n';
    }
    if (noEnd) {
      return line.replaceAll('\u200b', '');
    }

    return (
      line.replaceAll('\u200b', '') +
      (line.endsWith(';') ||
      line.endsWith('{') ||
      line.endsWith('}') ||
      line.replaceAll(' ', '') == '' ||
      line == '\u200b'
        ? ''
        : ';')
    );
  }
}
