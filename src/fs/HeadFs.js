// code for files systems that is imported in file on useage
export class fs {
  constructor(name) {
    // Try to load the file system from localStorage, or initialize as empty
    const storedFS = localStorage.getItem('CompileFileSystem');
    this.fs = storedFS ? JSON.parse(storedFS) : {};
    this.name = name
  }

  // Save the current file system to localStorage
  save() {
    localStorage.setItem('CompileFileSystem', JSON.stringify(this.fs));
  }

  // Create a new file or directory
  create( content = '', type = 'file') {
    if (this.fs[this.name]) {
      throw new Error(`File or directory named "${this.name}" already exists.`);
    }

    this.fs[this.name] = { content, type };
    this.save();
    console.log(`Created ${type}: ${this.name}`);
  }
  // Create a new file or directory
  createNoError( content = '', type = 'file') {
    if (this.fs[this.name]) {
      if (content != '') {
        this.update( content);
      }
    } else {
      this.fs[this.name] = { content, type };
      this.save();
      console.log(`Created ${type}: ${this.name}`);
    }
  }

  // Read a file's content
  read(name) {
    const file = this.fs[this.name];
    if (!file || file.type !== 'file') {
      throw new Error(`File "${this.name}" does not exist.`);
    }
    return file.content;
  }

  noErrorRead(name) {
    const file = this.fs[this.name];
    if (!file || file.type !== 'file') {
      return undefined;
    }
    return file.content;
  }

  // Delete a file or directory
  delete(name) {
    if (!this.fs[this.name]) {
      throw new Error(`File or directory "${this.name}" does not exist.`);
    }
    delete this.fs[this.name];
    this.save();
    console.log(`Deleted: ${this.name}`);
  }

  // Check if a file or directory exists
  exists(name) {
    return !!this.fs[this.name];
  }

  // List all files and directories
  list() {
    return Object.keys(this.fs);
  }

  // Update the content of a file
  update( newContent) {
    const file = this.fs[this.name];
    if (!file || file.type !== 'file') {
      throw new Error(`File "${this.name}" does not exist.`);
    }
    file.content = newContent;
    this.save();
  }

  // Create a directory (for illustration, can be extended further)
  createDirectory(name) {
    this.create( '', 'directory');
  }
}
