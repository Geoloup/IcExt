// code that is lunch for each line to check for error run return code. If error return true and show error in console
function error(err, type = '') {
  var output = document.getElementById('errors');
  output.innerHTML += `<a style='color:red;'>${type}Error ${err}<a>\n`;
}



export function ErrCheck(line, num, fileName) {
  // clear the line cache
  var line = line.trim(); // remove spaces
  var line = line.replaceAll(';', ''); // remove ; for checks
  if (line.endsWith('=')) {
    console.log(
      `Unexpected token <a style='color:black;'>=</a> at file ${fileName}.ihat line ${num}`,
      'Syntax'
    );
    error(`Unexpected token = at file ${fileName}.ihat line ${num}`, 'Syntax');
    showTab('tab3');
    return true;
  }
}
