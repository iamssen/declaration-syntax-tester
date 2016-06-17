const ts = require('typescript');
const fs = require('fs');
const chalk = require('chalk');
const path = require('path');
const stack = require('stack-trace');
const os = require('os');

const defaultOptions = {
  target: ts.ScriptTarget.ES5,
  module: ts.ModuleKind.CommonJS,
  outDir: os.tmpdir()
}

function getTempFile() {
  const sourceDir = path.dirname(stack.parse(new Error())[2].fileName);
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const rand = [...new Array(5)].map(() => characters.charAt(Math.floor(Math.random() * characters.length)));
  return path.join(sourceDir, `.test-${rand.join()}.ts`);
}

function removeTempFile(tempFile) {
  fs.exists(tempFile, exists => {
    if (exists) fs.unlink(tempFile, err => {
      if (err) console.log(err);
    });
  });
}

function compile(source, options, tempFile) {
  fs.writeFileSync(tempFile, source, {encoding: 'utf8'});

  const program = ts.createProgram([tempFile], options);
  const emitResult = program.emit();
  const diagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

  return diagnostics.map(diagnostic => {
    const {line, character} = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
    return {
      fileName: diagnostic.file.fileName,
      line: line + 1,
      character: character + 1,
      message
    };
  });
}

module.exports = function (options) {
  options = Object.assign({}, defaultOptions, options);

  function accept(source) {
    const tempFile = getTempFile();
    const diagnostics = compile(source, options, tempFile);
    if (diagnostics.length > 0) {
      let message = [chalk.red(source)];
      diagnostics.forEach(diagnostic => {
        if (diagnostic.fileName !== tempFile) message.push(`${diagnostic.fileName} (${diagnostic.line},${diagnostic.character})`);
        message.push(diagnostic.message);
      });
      removeTempFile(tempFile);
      return new Error(message);
    }
    removeTempFile(tempFile);
    return null;
  }
  
  function reject(source) {
    const tempFile = getTempFile();
    const diagnostics = compile(source, options, tempFile);
    if (diagnostics.length === 0) {
      removeTempFile(tempFile);
      return new Error(chalk.red(source));
    }
    removeTempFile(tempFile);
    return null;
  }
  
  return {accept, reject};
}