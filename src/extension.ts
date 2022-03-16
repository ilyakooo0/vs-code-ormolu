// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as proc from 'child_process';
import { Range } from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
const haskellLangId = 'haskell';
export function activate(context: vscode.ExtensionContext) {
  vscode.languages.registerDocumentRangeFormattingEditProvider(haskellLangId, {
    provideDocumentRangeFormattingEdits(document, range, options, token) {
      const showErrorMessage = (friendlyText: string, error: { stderr: { toString: () => void; }; }) => {
        vscode.window.showWarningMessage(`${friendlyText}\n${error.stderr.toString()}`);
        return [];
      };

      try {
        proc.execSync(cfg.executablePath + ' --help');
      } catch (e) {
        return showErrorMessage("Ormolu is not installed", e);
      }

      const cfg = vscode.workspace.getConfiguration("ormolu");

      let command = cfg.executablePath;

      command += ` --start-line ${range.start.line + 1} --end-line ${range.end.line + (range.end.character == 0 ? 0 : 1)}`

      for (let [key, value] of Object.entries(cfg.extensions)) {
        if (value) {
          command += " -o -X" + key;
        }
      }

      if (cfg.customArguments !== null) {
        command += " " + cfg.customArguments;
      }

      if (cfg.tolerateCpp) {
        command += " -p";
      }

      if (cfg.unsafe) {
        command += " -u";
      }

      if (cfg.checkIdempotency) {
        command += " -c";
      }

      const text = document.getText();
      let formattedText;
      try {
        formattedText = proc.execSync(command, { input: text }).toString();
      } catch (e) {
        return showErrorMessage('Ormolu failed to format the code', e);
      }

      const fullDocumentRange =
        new Range
          (document.lineAt(0).range.start
            , document.lineAt(document.lineCount - 1).range.end
          );

      return [vscode.TextEdit.replace(fullDocumentRange, formattedText)];
    }
  });
}

// this method is called when your extension is deactivated
export function deactivate() { }
