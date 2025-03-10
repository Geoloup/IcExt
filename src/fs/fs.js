export class FakeFileSystem {
  constructor(projectName = 'fakeFileSystem') {
    this.location = 'project-' + projectName;
    console.log(this.location);
    // Try to load the file system from localStorage, or initialize as empty
    const storedFS = localStorage.getItem(this.location);
    this.fs = storedFS ? JSON.parse(storedFS) : {};
  }

  // Save the current file system to localStorage
  save() {
    localStorage.setItem(this.location, JSON.stringify(this.fs));
  }

  get(name) {
    return this.fs[name];
  }

  // Create a new file or directory
  create(name, content = '', type = 'file') {
    if (this.fs[name]) {
      throw new Error(`File or directory named "${name}" already exists.`);
    }

    this.fs[name] = { content, type };
    this.save();
  }
  // Create a new file or directory
  createNoError(name, content = '', type = 'file') {
    if (this.fs[name]) {
      if (content != '') {
        this.update(name, content);
      }
    } else {
      this.fs[name] = { content, type };
      this.save();
    }
  }

  // Read a file's content
  read(name) {
    const file = this.fs[name];
    if (!file || file.type !== 'file') {
      throw new Error(`File "${name}" does not exist.`);
    }
    return file.content;
  }

  noErrorRead(name) {
    const file = this.fs[name];
    if (!file || file.type !== 'file') {
      return undefined;
    }
    return file.content;
  }

  // Delete a file or directory
  delete(name) {
    if (!this.fs[name]) {
      throw new Error(`File or directory "${name}" does not exist.`);
    }
    delete this.fs[name];
    this.save();
    console.log(`Deleted: ${name}`);
  }

  deleteWithConf(name) {
    if (!this.fs[name]) {
      throw new Error(`File or directory "${name}" does not exist.`);
    }
  }

  // Check if a file or directory exists
  exists(name) {
    return !!this.fs[name];
  }

  // List all files and directories
  list() {
    return Object.keys(this.fs);
  }

  // Update the content of a file
  update(name, newContent) {
    const file = this.fs[name];
    if (!file || file.type !== 'file') {
      throw new Error(`File "${name}" does not exist.`);
    }
    file.content = newContent;
    this.save();
  }

  // Create a directory (for illustration, can be extended further)
  createDirectory(name) {
    this.create(name, '', 'directory');
  }
}
