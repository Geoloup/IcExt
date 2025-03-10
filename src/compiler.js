import { Scope } from './compiler/scope.js';
import { Builtins } from './compiler/builtins.js';
import { Parser } from './compiler/parser.js';

export class ExtensionCompiler {
  constructor() {
    this.scope = new Scope();
    this.builtins = new Builtins();
  }

  compile(code) {
    document.getElementById('errors').innerHTML = '';
    this.scope.clear();
    const lines = code.split('\n');
    var builtinsFS = window.fs.read('open.js');
    var builtinsIcHat = window.fs.read('ichat.js');
    var headerCode = 'async function main() {\n'; // use var to add data to the compile code like builtins custom function internal. (Example : open)
    var footerCode = '};\nmain()';
    let compiledCode =
      '/*please add to the html for external website. :     <script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js"></script><script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-database.js"></script>*/' +
      headerCode +
      builtinsFS +
      '\n' +
      builtinsIcHat +
      '\n';

    // Add variable declarations at the start
    const declarations = this.scope.getAllDeclarations();
    if (declarations) {
      compiledCode += '  ' + declarations + '\n\n';
    }

    // Compile code
    var notBreak = true;
    let indentLevel = 1;
    var lineNum = 0;
    for (let line of lines) {
      if (!line.trim()) continue;

      if (line.trim().startsWith('}')) indentLevel--;
      lineNum++;
      const compiled = Parser.parseLine(
        line,
        this.scope,
        this.builtins,
        ExtensionCompiler,
        lineNum,
        false,
        activeFile.replace('.ihat', '')
      );
      if (compiled == false) {
        notBreak = false;
        break;
      }
      if (compiled) {
        compiledCode += '  '.repeat(indentLevel) + compiled + '\n';
      }

      if (line.trim().endsWith('{')) indentLevel++;
    }
    if (notBreak == false) {
      return notBreak;
    }
    compiledCode += footerCode;
    return compiledCode;
  }

  compileModule(code, name, moduleList) {
    this.scope.clear();
    const lines = code.split('\n');

    var parms = [];
    var name = name.replaceAll('/', '.');
    var fullpath = '';
    name.split('.').forEach((paths) => {
      if (parms.length == 0) {
        parms.push(`var ${paths} = {}`);
        fullpath = paths;
      } else {
        parms.push(`${fullpath}.${paths} = {}`);
        fullpath = fullpath + '.' + paths;
      }
    });

    // var ${name.replaceAll('/','.')} = {}
    let compiledCode = `\n${parms.join('\n')}\n`;

    // Add variable declarations at the start
    const declarations = this.scope.getAllDeclarations();
    if (declarations) {
      compiledCode += '  ' + declarations + '\n\n';
    }

    // Compile code
    var notBreak = true;
    let indentLevel = 1;
    var lineNum = 0;
    for (let line of lines) {
      if (!line.trim()) continue;

      if (line.trim().startsWith('}')) indentLevel--;
      lineNum++;
      const compiled = Parser.parseLine(
        line,
        this.scope,
        this.builtins,
        ExtensionCompiler,
        lineNum,
        true,
        name,
        undefined,
        moduleList
      );
      if (compiled == false) {
        notBreak = false;
        break;
      }
      if (compiled) {
        compiledCode += '  '.repeat(indentLevel) + compiled + '\n';
      }

      if (line.trim().endsWith('{')) indentLevel++;
    }
    return compiledCode;
  }

  execute(code) {
    const compiled = this.compile(code);
    if (compiled == false) {
      return;
    }
    console.log('hi');
    try {
      var output = document.getElementById('output');
      output.innerHTML = `Compiling Code\n`;
      const iframe = document.getElementById('runner');
      iframe.contentWindow.location.reload();
      setTimeout(() => {
        output.innerHTML = `Code compilied\n`;
        const iframeWindow = iframe.contentWindow;
        const iframeDocument = iframeWindow.document;
        // Capture logs from the iframe by overriding console.log
        const MAX_STRING_LENGTH = 50;

        function arrayToHTML(obj, depth = 0, maxDepth = 5) {
          if (depth >= maxDepth) return '<li>Max depth reached...</li>';

          let html = '<ul class="array">';
          for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
              const value = obj[key];

              if (Array.isArray(value)) {
                html += `<li><strong>${key}:</strong> ${arrayToHTML(
                  value,
                  depth + 1,
                  maxDepth
                )}</li>`;
              } else if (typeof value === 'object' && value !== null) {
                html += `<li><strong>${key}:</strong> ${objectToHTML(
                  value,
                  depth + 1,
                  maxDepth
                )}</li>`;
              } else {
                html += `<li><strong>${key}:</strong> ${truncateString(
                  value
                )}</li>`;
              }
            }
          }
          html += '</ul>';
          return html;
        }

        function objectToHTML(obj, depth = 0, maxDepth = 5) {
          if (depth >= maxDepth) return '<li>Max depth reached...</li>';

          let html = '<ul class="object">';
          for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
              const value = obj[key];

              if (Array.isArray(value)) {
                html += `<li><strong>${key}:</strong> ${arrayToHTML(
                  value,
                  depth + 1,
                  maxDepth
                )}</li>`;
              } else if (typeof value === 'object' && value !== null) {
                html += `<li><strong>${key}:</strong> ${objectToHTML(
                  value,
                  depth + 1,
                  maxDepth
                )}</li>`;
              } else {
                html += `<li><strong>${key}:</strong> ${truncateString(
                  value
                )}</li>`;
              }
            }
          }
          html += '</ul>';
          return html;
        }

        function truncateString(value, maxLength = 50) {
          if (typeof value !== 'string') value = String(value);
          return value.length > maxLength
            ? value.slice(0, maxLength) + '...'
            : value;
        }

        iframeWindow.console.log = function (...args) {
          var newargs = [];
          args.forEach((arg) => {
            if (typeof arg == 'object' && !Array.isArray(arg)) {
              newargs.push(objectToHTML(arg));
            } else if (typeof arg == 'object' && Array.isArray(arg)) {
              newargs.push(arrayToHTML(arg));
            } else {
              newargs.push(arg);
            }
          });
          console.log('Captured Log', ...newargs); // Log to parent window
          output.innerHTML += newargs.join(' ') + '\n';
        };
        iframeWindow.console.error = function (...args) {
          var newargs = [];
          args.forEach((arg) => {
            if (typeof arg == 'object' && !Array.isArray(arg)) {
              newargs.push(objectToHTML(arg));
            } else if (typeof arg == 'object' && Array.isArray(arg)) {
              newargs.push(arrayToHTML(arg));
            } else {
              newargs.push(arg);
            }
          });
          output.innerHTML += '[Error] ' + args.join('\n') + '\n';
          console.error('Captured Error', ...newargs); // Log to parent window
        };
        function loadScript(src, callback) {
          const script = iframeDocument.createElement('script');
          script.src = src;
          script.onload = callback;
          script.onerror = () => console.error(`Error loading script: ${src}`);
          iframeDocument.head.appendChild(script);
        }

        // Load Firebase scripts sequentially
        loadScript(
          'https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js',
          () => {
            console.log('Firebase App Loaded');
            loadScript(
              'https://www.gstatic.com/firebasejs/8.10.0/firebase-database.js',
              () => {
                loadScript(
                  'https://unpkg.com/peerjs@1.4.7/dist/peerjs.min.js',
                  () => {
                    console.log('Firebase Database Loaded');
                    // Now Firebase is loaded, evaluate code inside iframe
                    try {
                      iframeWindow.eval(compiled);
                    } catch (error) {
                      if (error.stack) {
                        iframeWindow.console.error(error.message);
                      } else {
                        iframeWindow.console.error(error.message);
                      }
                    }
                  }
                );
              }
            );
          }
        );
      }, 250);
      return null;
    } catch (error) {
      console.error('Execution error:', error);
      throw error;
    }
  }
}
