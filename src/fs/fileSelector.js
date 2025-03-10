export class FileSystemView {
  constructor(fs, switchFile) {
    this.fs = fs;
    this.switchFile = switchFile;
    this.openFolder = openFolder;
  }
  list() {
    const files = this.fs.list();
    const dom = document.getElementById('file-view');
    var Preopen = dom.querySelectorAll('a.open');
    var open = [];
    Preopen.forEach(function (element) {
      open.push(element);
    });
    dom.innerHTML = '';
    files.forEach((file) => {
      console.log(file);
      if (file.endsWith('.js')) {
        // Hide .js files as they may contain local code
      } else if (
        this.fs.get(file).type == 'directory' &&
        file.indexOf('/') != -1
      ) {
        var folderDom = document.getElementById(
          `folderViewFile-` + file.slice(0, file.lastIndexOf('/'))
        );
        console.log(file.slice(0, file.lastIndexOf('/') + 1));
        const fileView = document.createElement('div');
        const fileViewTop = document.createElement('a');
        fileViewTop.classList.add('pen');
        fileView.classList.add('folder');
        fileView.id = `folderView-${file}`;
        fileView.onclick = this.openFolder;
        const openState = document.createElement('i');
        openState.classList.add('bx');
        const fileBlank = document.createElement('i');
        fileBlank.classList.add('bx');
        fileBlank.classList.add('bx-file-blank');
        fileBlank.onclick = function () {
          fsView.createFile(file + '/');
        };
        const folderBlank = document.createElement('i');
        folderBlank.classList.add('bx');
        folderBlank.classList.add('bx-folder');
        folderBlank.onclick = function () {
          fsView.createFolder(file + '/');
        };
        const text = document.createTextNode(
          file.slice(file.lastIndexOf('/') + 1, file.length)
        );
        const fileBank = document.createElement('div');
        fileBank.classList.add('folderFile');
        fileBank.id = `folderViewFile-${file}`;
        const deleteIcon = document.createElement('i');
        deleteIcon.classList.add('bx');
        deleteIcon.classList.add('bx-trash');
        deleteIcon.dataset.file = file;
        deleteIcon.onclick = function (event) {
          var file = event.target.dataset.file;
          fs.delete(file);
          window.fsView.list();
        };

        fileViewTop.append(openState);
        fileViewTop.append(text);
        fileViewTop.append(fileBlank);
        fileViewTop.append(folderBlank);
        fileViewTop.append(deleteIcon);
        fileView.append(fileViewTop);
        fileView.append(fileBank);
        if (!open.some((el) => el == fileViewTop)) {
          console.log('open');
          fileViewTop.classList.add('open');
          openState.classList.add('bx-chevron-down');
        } else {
          openState.classList.add('bx-chevron-right');
        }
        folderDom.appendChild(fileView);
      } else if (this.fs.get(file).type == 'directory') {
        // Create an anchor element to represent the file
        const fileView = document.createElement('div');
        const fileViewTop = document.createElement('a');
        fileViewTop.classList.add('pen');

        fileView.classList.add('folder');
        fileView.id = `folderView-${file}`;
        fileView.onclick = this.openFolder;
        const openState = document.createElement('i');
        openState.classList.add('bx');
        const fileBlank = document.createElement('i');
        fileBlank.classList.add('bx');
        fileBlank.classList.add('bx-file-blank');
        fileBlank.onclick = function () {
          fsView.createFile(file + '/');
        };
        const folderBlank = document.createElement('i');
        folderBlank.classList.add('bx');
        folderBlank.classList.add('bx-folder');
        folderBlank.onclick = function () {
          fsView.createFolder(file + '/');
        };
        const text = document.createTextNode(file);
        const fileBank = document.createElement('div');
        fileBank.classList.add('folderFile');
        fileBank.id = `folderViewFile-${file}`;
        const deleteIcon = document.createElement('i');
        deleteIcon.classList.add('bx');
        deleteIcon.classList.add('bx-trash');
        deleteIcon.dataset.file = file;
        deleteIcon.onclick = function (event) {
          var file = event.target.dataset.file;
          fs.delete(file);
          window.fsView.list();
        };

        fileViewTop.append(openState);
        fileViewTop.append(text);
        fileViewTop.append(fileBlank);
        fileViewTop.append(folderBlank);
        fileViewTop.append(deleteIcon);
        fileView.append(fileViewTop);
        fileView.append(fileBank);
        if (!open.some((el) => el == fileViewTop)) {
          console.log('open');
          fileViewTop.classList.add('open');
          openState.classList.add('bx-chevron-down');
        } else {
          openState.classList.add('bx-chevron-right');
        }
        dom.appendChild(fileView);
      } else if (file.indexOf('/') == -1) {
        // Create an anchor element to represent the file
        const fileView = document.createElement('a');
        fileView.classList.add('file');
        fileView.id = `fileView-${file}`;
        fileView.onclick = this.switchFile;
        fileView.append(document.createTextNode(file));
        const deleteIcon = document.createElement('i');
        deleteIcon.classList.add('bx');
        deleteIcon.classList.add('bx-trash');
        deleteIcon.dataset.file = file;
        deleteIcon.onclick = function (event) {
          window.fsView.list();
          var file = event.target.dataset.file;
          fs.delete(file);
        };
        fileView.append(deleteIcon);
        dom.appendChild(fileView);
      } else if (file.indexOf('/') != -1) {
        console.log(file.slice(0, file.indexOf('/')));
        var folderDom = document.getElementById(
          `folderViewFile-` + file.slice(0, file.lastIndexOf('/'))
        );
        // Create an anchor element to represent the file
        const fileView = document.createElement('a');
        fileView.classList.add('file');
        fileView.innerText = file.slice(file.lastIndexOf('/') + 1, file.length);
        fileView.id = `fileView-${file}`;
        fileView.onclick = this.switchFile;
        const deleteIcon = document.createElement('i');
        deleteIcon.classList.add('bx');
        deleteIcon.classList.add('bx-trash');
        deleteIcon.dataset.file = file;
        deleteIcon.onclick = function (event) {
          var file = event.target.dataset.file;
          fs.delete(file);
          window.fsView.list();
        };
        fileView.append(deleteIcon);
        folderDom.appendChild(fileView);
      }
    });
  }

  createFile(basepath) {
    const dom = document.getElementById('file-view');
    this.addInteractiveElement('file', dom, basepath);
  }

  createFolder(basepath) {
    const dom = document.getElementById('file-view');
    this.addInteractiveElement('directory', dom, basepath);
  }

  // Function to add an interactive element for creating files or directories
  addInteractiveElement(type, dom, basepath) {
    const interactiveElement = document.createElement('a');
    interactiveElement.classList.add(type, 'interactive');
    interactiveElement.innerText = `Create ${type}`;
    interactiveElement.id = `${type}-interactive`;

    // Create a hidden input element
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = `Enter ${type} name`;
    input.classList.add(`${type}-input`);
    interactiveElement.innerHTML = ''; // Clear inner text
    interactiveElement.appendChild(input);

    // Handle input on blur (click away) or Enter key
    const handleInput = (event) => {
      if (event.type === 'blur' || event.key === 'Enter') {
        const value = input.value.trim();
        if (value) {
          if (basepath == undefined) {
            if (type === 'file') {
              this.fs.createNoError(value); // Simulate file creation
              this.list(); // Refresh the file list
            } else if (type === 'directory') {
              this.fs.createDirectory(value); // Simulate directory creation
              this.list(); // Refresh the file listf
            }
          } else {
            if (type === 'file') {
              this.fs.createNoError(basepath + value); // Simulate file creation
              this.list(); // Refresh the file list
            } else if (type === 'directory') {
              this.fs.createDirectory(basepath + value); // Simulate directory creation
              this.list(); // Refresh the file list
            }
          }
        }
        // Restore the original button state
        interactiveElement.innerHTML = `Create ${type}`;
        input.removeEventListener('blur', handleInput);
        input.removeEventListener('keydown', handleInput);
      }
    };

    input.addEventListener('blur', handleInput);
    input.addEventListener('keydown', handleInput);

    // Append the element to the specified DOM container
    dom.appendChild(interactiveElement);
    input.focus();
  }
}
