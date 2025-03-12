import { ExtensionCompiler } from './compiler.js';
import { setupEditor } from './editor/setup.js';
import { FakeFileSystem } from './fs/fs.js';
import { FileSystemView } from './fs/fileSelector.js';

function switchFile(event) {
  var editor = document.querySelector('#editor');
  editor.value = fs.read(event.target.id.replace('fileView-', ''));
  window.updateHighlight();
  window.activeFile = event.target.id.replace('fileView-', '');
}
window.switchFile = switchFile;

window.waittime = 0;
function openFolder(event) {
  var folderElement = event.target;
  if (
    event.target.classList.contains('bx-file-blank') ||
    event.target.classList.contains('bx-folder') ||
    event.target.classList.contains('file')
  ) {
    return null;
  }
  if (window.waittime == 1) {
    return null;
  }
  var i = folderElement.querySelector('i.bx-chevron-down, i.bx-chevron-right');
  if (i == null) {
    var folderElement = event.target.parentElement;
    var i = folderElement.querySelector(
      'i.bx-chevron-down, i.bx-chevron-right'
    );
  }
  if (i.classList.contains('bx-chevron-down')) {
    i.classList.remove('bx-chevron-down');
    folderElement.classList.remove('open');
    i.classList.add('bx-chevron-right');
  } else {
    i.classList.remove('bx-chevron-right');
    i.classList.add('bx-chevron-down');
    folderElement.classList.add('open');
  }
  window.waittime = 1;
  setTimeout(() => {
    window.waittime = 0;
  }, 50);
}

window.openFolder = openFolder;
var ProjectLocation = localStorage.getItem('project');
document.getElementById('title').innerText = `Current Project : ${ProjectLocation}`
window.fs = new FakeFileSystem(ProjectLocation);
const fs = window.fs;
window.fsView = new FileSystemView(fs, switchFile, openFolder);
const fsView = window.fsView;
document.getElementById('createFile').onclick = function () {
  fsView.createFile();
};
document.getElementById('createFolder').onclick = function () {
  fsView.createFolder();
};
fsView.list();
window.activeFile = 'main.ihat';
if (fs.exists('main.ihat') == false) {
  fs.create('main.ihat','')
}

if (ProjectLocation == 'example') {
  if (fs.exists('main.ihat') == false) {
    fs.create(
      'main.ihat',
      `
  // This is a comment
  
  // import files
  import example
  
  // file
  var file = open('example.ihat')
  print(file.read())
  
  // open local file "editor file"
  var file = openLocal('example.ihat')
  print(file.read())
  
  // Variables
  var greeting = "Hello, World!"
  var count = 0
  
  // table or dict are supported
  
  // Functions
  func handleClick() {
      print(greeting)
      count = count + 1
      print("Click count:" + count)
  }
  handleClick()
  
  // loop
  // while repeat max 120 times
  while (true) {
      handleClick()
  }`
    );
  }

  fs.createNoError(
    'example.ihat',
    'func example() {\nprint("example function")\n}'
  );
}

fetch('src/fs/eventLine.js')
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.text();
  })
  .then((data) => {
    fs.createNoError('ichat.js', data);
  })
  .catch((err) => {
    console.error('Error fetching the file:', err);
  });

fs.createNoError(
  'open.js',
  `// ihat builtins : open
  class fileApi {
    constructor(name) {
      // Try to load the file system from localStorage, or initialize as empty
      const storedFS = localStorage.getItem('CompileFileSystem');
      this.fs = storedFS ? JSON.parse(storedFS) : {};
      this.name = name
      try {
        this.read()
      } catch {
        this.create('')
      }
    }
  
    // Save the current file system to localStorage
    save() {
      localStorage.setItem('CompileFileSystem', JSON.stringify(this.fs));
    }
  
    // Create a new file or directory
    create(content = '', type = 'file') {
      if (this.fs[this.name]) {
        throw new Error(` +
    '`File or directory named "${this.name}" already exists.`' +
    `);
      }
      this.fs[this.name] = { content, type };
      this.save();
      console.log(` +
    '`Created ${type}: ${this.name}`' +
    `);
    }
    // Create a new file or directory
    createNoError(content = '', type = 'file') {
      if (this.fs[this.name]) {
        if (content != '') {
          this.update(this.name, content);
        }
      } else {
        this.fs[this.name] = { content, type };
        this.save();
        console.log(` +
    '`Created ${type}: ${this.name}`' +
    `);
      }
    }
  
    // Read a file's content
    read() {
      const file = this.fs[this.name];
      if (!file || file.type !== 'file') {
        throw new Error(` +
    '`File "${this.name}" does not exist.`' +
    `);
      }
      return file.content;
    }
  
    noErrorRead() {
      const file = this.fs[this.name];
      if (!file || file.type !== 'file') {
        return undefined;
      }
      return file.content;
    }
  
    // Delete a file or directory
    delete() {
      if (!this.fs[this.name]) {
        throw new Error(` +
    '`File or directory "${this.name}" does not exist.`' +
    `);
      }
      delete this.fs[this.name];
      this.save();
      console.log(` +
    '`Deleted: ${this.name}`' +
    `);
    }
  
    // Check if a file or directory exists
    exists() {
      return !!this.fs[this.name];
    }
  
    // List all files and directories
    list() {
      return Object.keys(this.fs);
    }
  
    // Update the content of a file
    write(newContent) {
      const file = this.fs[this.name];
      if (!file || file.type !== 'file') {
        throw new Error(` +
    '`File "${this.name}" does not exist.`' +
    `);
      }
      file.content = newContent;
      this.save();
    }  
    writeReturn(newContent) {
      const file = this.fs[this.name];
      if (!file || file.type !== 'file') {
        throw new Error(` +
    '`File "${this.name}" does not exist.`' +
    `);
      }
      file.content = newContent;
      this.save();
      return new fileApi(this.name)
    } 
  }
  `
);
fsView.list();

// Initialize compiler
const compiler = new ExtensionCompiler();

// Editor setup and syntax highlighting
document.addEventListener('DOMContentLoaded', () => {
  const editor = document.getElementById('editor');
  const highlight = document.querySelector('#highlight code');
  if (fs.noErrorRead('main.ihat')) {
    editor.value = fs.noErrorRead('main.ihat');
  }
  setupEditor(editor, highlight);
});

// Export run code function
export function runCode() {
  const code = document.getElementById('editor').value;
  const output = document.getElementById('output');

  try {
    const compiledCode = compiler.compile(code);

    // Then execute
    output.innerHTML = '';
    compiler.execute(code);
  } catch (error) {
    output.innerHTML += `Error: ${error.message}\n`;
  }
}
// Export exit function
export function exit() {
  output.innerHTML =`Saving project please wait.`;
  setTimeout(()=>{
    location.replace('/')
  },1000)
}
