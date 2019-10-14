// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import EpubPreview from './epubPreview';

export function activate(context: vscode.ExtensionContext) {
	let epubCommand = vscode.commands.registerCommand('epub.preview', (uri) => {
        let resource = uri;
        if (!(resource instanceof vscode.Uri)) {
            vscode.window.showInformationMessage("Use the explorer context menu or editor title menu to preview Epub files.");
            return;
        }

        const preview = new EpubPreview(context, resource);
        preview.createPanel();
        return ;
	});

	context.subscriptions.push(epubCommand);
}

// this method is called when your extension is deactivated
export function deactivate() {}
