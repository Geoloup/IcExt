// Editor setup and management
import { customLanguageDefinition } from '../syntax/highlighting.js';
import { ExtensionCompiler } from '../compiler.js';

// const fs = new FakeFileSystem();

export function fileupdate(fs, filename, content) {
  try {
    fs.create(filename, content);
  } catch {}

  fs.update(filename, content);
}

export function adjustPrismPadding(nonPrismBox, prismBox) {
  /*const nonPrismHeight = nonPrismBox.scrollHeight;
  const prismHeight = prismBox.scrollHeight;

  // Calculate the difference, taking the default 15px padding into account
  const defaultPadding = 15; // Default padding in pixels
  const additionalPadding = Math.abs((nonPrismHeight - prismHeight));
  if (additionalPadding > 0) {
    prismBox.style.paddingBottom = `${defaultPadding + additionalPadding}px`;
    prismBox.style.height = `calc(100% - ${72 + additionalPadding}px)`;
  } else {
    prismBox.style.paddingBottom = `${defaultPadding}px`;
    prismBox.style.height = `calc(100% - 35px)`;
  }*/
}

export function syncSelection() {
  var textarea = document.querySelector('#editor');
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const codeText = textarea.value;
  if (start != end) {
    // Wrap the selected text with markers to highlight it in Prism.js
    const highlightedText =
      codeText.substring(0, start) +
      '<mark>' +
      codeText.substring(start, end) +
      '</mark>' +
      codeText.substring(end);
    //window.updateHighlight(highlightedText);
  }
}

export function setupEditor(editor, highlight) {
  // Register custom language
  try {
    Prism.languages.ihat = customLanguageDefinition;
    function updateHighlight(highlightedText) {
      var target = document.getElementById('editor');
      var lineNumbers = document.getElementById('lineNumbers');
      // change line numbers
      const lines = target.value.split('\n');
      let lineNumberHTML = '';
      var size = 0;
      for (let i = 1; i <= lines.length; i++) {
        lineNumberHTML += `<span>${i}</span>\n`;
        if (i > 9) {
          var size = 5;
        }
        if (i > 99) {
          var size = 15;
        }
        if (i > 999) {
          var size = 20;
        }
        if (i > 9999) {
          var size = 25;
        }
      }

      document
        .querySelector('.editor-container')
        .style.setProperty('--lineSize', size + 'px');
      lineNumbers.innerHTML = lineNumberHTML;
      // compile and error check
      if (highlightedText != undefined && typeof highlightedText != 'object') {
        highlight.textContent = highlightedText;
        Prism.highlightElement(highlight);
      } else {
        highlight.textContent = editor.value + '\u200B';
        Prism.highlightElement(highlight);
      }
      new ExtensionCompiler().compile(editor.value);
      document.querySelector('#lineNumbers').scrollTop = target.scrollTop;
      document.querySelector('#highlight').scrollTop = target.scrollTop;
      document.querySelector('#highlight').scrollLeft = target.scrollLeft;
      adjustPrismPadding(target, document.querySelector('#highlight'));
    }
    window.updateHighlight = updateHighlight;
    Prism.hooks.add('before-highlight', function (env) {
      if (env.language === 'ihat') {
        env.code = env.code.replace(
          /(['"])([^'"])(<[/]?mark>)([^'"]+['"])/gi,
          (match, p1, p2, p3) => {
            const plusValue = p1 === '"' ? '"+' : "'+'";
            return `${p1}${plusValue}${p2}${plusValue}${p3}`;
          }
        );
      }
    });
    // Sync scroll position
    document.querySelector('#editor').addEventListener('scroll', (event) => {
      var target = document.getElementById('editor');
      document.querySelector('#lineNumbers').scrollTop = target.scrollTop;
      document.querySelector('#highlight').scrollTop = target.scrollTop;
      document.querySelector('#highlight').scrollLeft = target.scrollLeft;
      adjustPrismPadding(target, document.querySelector('#highlight'));
    });

    // Update highlighting on input
    editor.addEventListener('input', updateHighlight);

    // Initial highlight
    updateHighlight();
  } catch {
    console.warn('your running on offline version');
    editor.style.color = 'white';
  }

  // Add a keydown event listener to the textarea
  editor.addEventListener('keydown', function (event) {
    // Check if the pressed key is the Tab key (not Shift + Tab)
    if (event.key === 'Tab' && !event.shiftKey) {
      // Prevent the default tab behavior
      event.preventDefault();

      // Get the current cursor position
      const cursorPos = editor.selectionStart;

      // Get the current text in the textarea
      const text = editor.value;

      // Find the start of the current line
      const lineStart = text.lastIndexOf('\n', cursorPos - 1) + 1;

      // Insert 4 spaces at the start of the current line
      const newText =
        text.substring(0, lineStart) + '    ' + text.substring(lineStart);

      // Update the textarea's value with the new text
      editor.value = newText;

      // Set the cursor position after the inserted spaces
      editor.selectionStart = editor.selectionEnd = cursorPos + 4;
    }

    // Check if the pressed key is the Backspace key
    if (event.key === 'Backspace') {
      const cursorPos = editor.selectionStart;
      const text = editor.value;

      // Check if the previous 4 characters are spaces
      if (
        cursorPos >= 4 &&
        text.substring(cursorPos - 4, cursorPos) === '    '
      ) {
        // Prevent the default backspace behavior
        event.preventDefault();

        // Remove the last 4 spaces before the cursor position
        const newText =
          text.substring(0, cursorPos - 4) + text.substring(cursorPos);

        // Update the textarea's value with the new text
        editor.value = newText;

        // Set the cursor position to where the spaces were deleted
        editor.selectionStart = editor.selectionEnd = cursorPos - 4;
      }
    }

    // Check if the pressed key is Shift + Tab (Unindent)
    if (event.key === 'Tab' && event.shiftKey) {
      event.preventDefault();

      // Get the current cursor position
      const cursorPos = editor.selectionStart;

      // Get the current text in the textarea
      const text = editor.value;

      // Find the start of the current line
      const lineStart = text.lastIndexOf('\n', cursorPos - 1) + 1;

      // Check if there are 4 spaces at the start of the line
      if (
        cursorPos >= 4 &&
        text.substring(lineStart, lineStart + 4) === '    '
      ) {
        // Remove the first 4 spaces from the line
        const newText =
          text.substring(0, lineStart) + text.substring(lineStart + 4);

        // Update the textarea's value with the new text
        editor.value = newText;

        // Set the cursor position to where the spaces were deleted
        editor.selectionStart = editor.selectionEnd = cursorPos - 4;
      }
    }
    if (event.key == '"') {
      const cursorPos = editor.selectionStart;
      const cursorPosEnd = editor.selectionEnd;
      const text = editor.value;
      if (text.substring(cursorPos - 1, cursorPos) != '"') {
        event.preventDefault();
        const newText =
          text.substring(0, cursorPos) +
          '"' +
          text.substring(cursorPos, cursorPosEnd) +
          '"' +
          text.substring(cursorPosEnd);
        editor.value = newText;
        editor.selectionStart = editor.selectionEnd = cursorPos + 1;
        updateHighlight();
      }
    }
    if (event.key == "'") {
      const cursorPos = editor.selectionStart;
      const cursorPosEnd = editor.selectionEnd;
      const text = editor.value;
      if (text.substring(cursorPos - 1, cursorPos) != "'") {
        event.preventDefault();
        const newText =
          text.substring(0, cursorPos) +
          "'" +
          text.substring(cursorPos, cursorPosEnd) +
          "'" +
          text.substring(cursorPosEnd);
        editor.value = newText;
        editor.selectionStart = editor.selectionEnd = cursorPos + 1;
        updateHighlight();
      }
    }
    if (event.key == 'Enter') {
      console.log('tab check');

      const cursorPos = editor.selectionStart;
      const text = editor.value;

      const lineStart = text.lastIndexOf('\n', cursorPos) + 1;
      const lastLineStart = text.lastIndexOf('\n', lineStart - 2) + 1;

      const lastLine = text.slice(lastLineStart, lineStart);
      const currentLine = text.slice(lineStart).split('\n')[0].trim();
      if (
        lastLine.trimEnd().endsWith('{') ||
        lastLine.trimEnd().endsWith('(') ||
        lastLine.startsWith('    ') ||
        currentLine.startsWith('}') ||
        currentLine.startsWith(')')
      ) {
        if (
          lastLine.trimEnd().endsWith('{') ||
          lastLine.trimEnd().endsWith('(') ||
          currentLine.startsWith('}') ||
          currentLine.startsWith(')')
        ) {
          event.preventDefault();
          const leadingSpaces = lastLine.match(/^\s*/)[0].length;
          const indentAmount = Math.floor(leadingSpaces / 4) + 1;

          const newText =
            text.substring(0, cursorPos) +
            '\n' +
            '    '.repeat(indentAmount) +
            text.substring(cursorPos);

          editor.value = newText;
          editor.selectionStart = editor.selectionEnd =
            cursorPos + 4 * indentAmount + 1;
        } else {
          const leadingSpaces = lastLine.match(/^\s*/)[0].length;
          const indentAmount = Math.floor(leadingSpaces / 4);

          if (currentLine.startsWith('}')) {
            event.preventDefault();
            const newText =
              text.substring(0, lineStart) +
              '    '.repeat(Math.max(indentAmount - 1, 0)) +
              '\n' +
              text.substring(lineStart);

            editor.value = newText;
            editor.selectionStart = editor.selectionEnd =
              lineStart + 4 * Math.max(indentAmount - 1, 0);
          } else {
            event.preventDefault();
            const newText =
              text.substring(0, cursorPos) +
              '\n' +
              '    '.repeat(indentAmount) +
              text.substring(cursorPos);

            editor.value = newText;
            editor.selectionStart = editor.selectionEnd =
              cursorPos + 4 * indentAmount + 1;
          }
        }
      }
    }
    if (event.ctrlKey && event.key == 'Enter') {
      window.runCode();
    }
    if (event.shiftKey) {
      syncSelection();
    } else {
      updateHighlight();
    }
  });
  editor.addEventListener('keyup', function (event) {
    fileupdate(window.fs, window.activeFile, editor.value);
    fastSync(event);
  });
  function fastSync(event) {
    const textarea = document.getElementById('editor');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (event.shiftKey || event.buttons == 1) {
      syncSelection();
    } else if (start == end) {
      updateHighlight();
    }
  }
  editor.addEventListener('mousedown', syncSelection);
  editor.addEventListener('mousemove', fastSync);
  editor.addEventListener('click', fastSync);
}
