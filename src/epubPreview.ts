'use strict';
import { workspace, window, ExtensionContext, Disposable, Uri, ViewColumn, StatusBarAlignment, Webview, WebviewPanel, WebviewPanelOnDidChangeViewStateEvent } from 'vscode';
import * as path from 'path';

export default class EpubPreview {
    private _uri: Uri;
    private _panel: WebviewPanel;
    private _context: ExtensionContext;
    protected _disposables: Disposable[] = [];

    private _toc: any;
    private _statusBar;

    constructor(context: ExtensionContext, uri: Uri) {
        this._context = context;
        this._uri = uri;
    }

    public createPanel() {
        var title = `Preview '${path.basename(this._uri.fsPath)}'`;
        this._panel = window.createWebviewPanel(
            "EpubReaderWebviewPanel",
            title,
            this.getViewColumn(),
            {
                enableScripts: true,
                enableCommandUris: true,
                enableFindWidget: true
            });
        
        this._statusBar = window.createStatusBarItem(StatusBarAlignment.Right, 100);

        this._panel.onDidDispose(() => {
            this.dispose();
        }, null, this._disposables);

        this._panel.webview.onDidReceiveMessage((e) => {
            if (e.error) {
                window.showErrorMessage(e.error);
            }
            else  {
                switch (e.command) {
                    case "postToc":
                        this._toc = e.toc;
                    case "post"
                }
            }
        }, null, this._disposables);

        this._panel.webview.html = this.html;
    }

    public dispose() {
        this._panel.dispose();
        this._statusBar.dispose();
        while (this._disposables.length) {
            const item = this._disposables.pop();
            if (item) {
                item.dispose();
            }
        }
    }

    public getResourceUri(resourceName: string): Uri {
        return this._panel.webview.asWebviewUri(Uri.file(path.join(this._context.extensionPath, 'resources', resourceName)));
    }

    get fileUri(): Uri {
        return this._panel.webview.asWebviewUri(this._uri);
    }

    get html(): string {
        return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<script src="${this.getResourceUri('epub.min.js')}"></script>
<script src="${this.getResourceUri('jszip.min.js')}"></script>
<script src="${this.getResourceUri('previewer.js')}"></script>
<body>
    <div id="area"></div>
</body>                
<script type="text/javascript">
    var previewer = new EpubPreviewer("${this.fileUri}");
    previewer.postToc();
    previewer.show("area");
</script>
</html>`;
    }

    private getViewColumn(): ViewColumn {
        const active = window.activeTextEditor;
        return active ? active.viewColumn : ViewColumn.One;
    }
}