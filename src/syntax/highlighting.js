// Syntax highlighting configuration
export const customLanguageDefinition = {
  comment: /\/\/.*$/m,
  string: /{(?:[^{}]|{(?:[^{}]|{[^{}]*})*})*}|\"(?:\\?.)*?\"/,
  keyword: /\b(?:func|thread|var|class)\b/,
  function:
    /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,
  boolean: /\b(?:true|false)\b/,
  number: /\b\d+\b/,
  operator: /[+\-*/=<>!&|]+/,
  punctuation: /[(){}[\],;]/,
  keyword: [
    { pattern: /((?:^|\})\s*)catch\b/, lookbehind: true },
    {
      pattern:
        /(^|[^.]|\.\.\.\s*)\b(?:as|assert(?=\s*\{)|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|wait|thread|break|case|class|const|continue|default|delete|do|else|enum|extends|finally(?=\s*(?:\{|$))|for|from(?=\s*(?:['"]|$))|func|(?:get|set)(?=\s*(?:[#\[$\w\xA0-\uFFFF]|$))|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/,
      lookbehind: true,
    },
  ],
  string: {
    greedy: 'true',
    pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
  },
  number:
    /\b(?:(?:0[xX](?:[\dA-Fa-f](?:_[\dA-Fa-f])?)+|0[bB](?:[01](?:_[01])?)+|0[oO](?:[0-7](?:_[0-7])?)+)n?|(?:\d(?:_\d)?)+n|NaN|Infinity)\b|(?:\b(?:\d(?:_\d)?)+\.?(?:\d(?:_\d)?)*|\B\.(?:\d(?:_\d)?)+)(?:[Ee][+-]?(?:\d(?:_\d)?)+)?/,
};
