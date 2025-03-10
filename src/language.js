// Example usage and language definition
const compiler = new ExtensionCompiler();

// Define the language syntax through examples
const exampleCode = `
// This is a comment
extension "My Custom Extension"

// Variables
var greeting = "Hello, World!"
var count = 0

// table or dict are not supported

// Functions
func handleClick() {
  print(greeting)
  count = count + 1
  print("Click count:", count)
}

// Extension-specific features
addListener('click', handleClick)
createTab('https://example.com')
`;

// Test the compiler
console.log('Testing the custom language:');
compiler.execute(exampleCode);