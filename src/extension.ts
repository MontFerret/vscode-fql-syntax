import * as vscode from 'vscode';
import cp = require('child_process');
import path = require('path');

export function activate(context: vscode.ExtensionContext) {
    const runFerret = vscode.commands.registerCommand('ferret.run_file', async () => {
        const output = vscode.window.createOutputChannel("Run Ferret");
        output.show(true);

        if (!vscode.window.activeTextEditor) {
            vscode.window.showWarningMessage("Open tab with FQL file");
            return;
        }

        const fullFilename = vscode.window.activeTextEditor.document.fileName;
        const baseFilename = path.parse(fullFilename).base;
        const cmd = `ferret < ${fullFilename}`;

        output.appendLine(`Running: ${cmd}`);

        const { error, stdout, stderr } = await exec(cmd);
        if (error) {
            output.appendLine(`Error: ${stderr}`);
            vscode.window.showErrorMessage(`Query '${baseFilename}' failed with error`);
            return
        }

        output.appendLine(prettyJSON(stdout));
        vscode.window.showInformationMessage(`Query '${baseFilename}' finished`);
    });

    context.subscriptions.push(runFerret);
}

function prettyJSON(s: string): string {
    return JSON.stringify(JSON.parse(s), null, 2);
}

function exec(command: string, options: cp.ExecOptions = null): Promise<{ error: cp.ExecException, stdout: string; stderr: string }> {
    return new Promise<{ error: cp.ExecException, stdout: string; stderr: string }>((resolve) => {
        cp.exec(command, options, (error, stdout, stderr) => {
            resolve({ error, stdout, stderr });
        });
    });
}

export function deactivate() { }
