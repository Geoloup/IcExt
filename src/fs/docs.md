// Example usage
const fs = new FakeFileSystem();

fs.create('file1.txt', 'This is the content of file1.');
console.log(fs.read('file1.txt')); // Output: This is the content of file1.

fs.update('file1.txt', 'Updated content for file1.');
console.log(fs.read('file1.txt')); // Output: Updated content for file1.

fs.createDirectory('folder1');
console.log(fs.list()); // Output: ['file1.txt', 'folder1']

fs.delete('file1.txt');
console.log(fs.list()); // Output: ['folder1']

fs.noErrorRead('main.ihat')
// ouput same as read if file does not exist does not return a error