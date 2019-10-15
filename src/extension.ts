// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as proc from 'child_process';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
const haskellLangId = 'haskell';
export function activate(context: vscode.ExtensionContext) {
  vscode.languages.registerDocumentRangeFormattingEditProvider(haskellLangId, {
    provideDocumentRangeFormattingEdits(document, range, options, token) {
      const showErrorMessage = (friendlyText: string, error: { stderr: { toString: () => void; }; }) => {
        vscode.window.showErrorMessage(`${friendlyText}\n${error.stderr.toString()}`);
        return [];
      };

      try {
        proc.execSync('ormolu --help');
      } catch (e) {
        return showErrorMessage("Ormolu is not installed", e);
      }

      const text = document.getText(range);
      let formattedText;
      try {
        formattedText = proc.execSync('ormolu', {input: text}).toString();
      } catch (e) {
        return showErrorMessage('Ormolu failed to format the code', e);
      }
      return [vscode.TextEdit.replace(range, formattedText)];
    }
  });
}

// this method is called when your extension is deactivated
export function deactivate() {}
