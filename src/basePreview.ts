'use strict';
import { workspace, window, ExtensionContext, Disposable, Uri, ViewColumn, Memento, Webview, WebviewPanel, WebviewPanelOnDidChangeViewStateEvent } from 'vscode';
import * as path from 'path';

export default abstract class BasePreview {
    
    private _storage: Memento;
    private _uri: Uri;
    private _previewUri: Uri;
    private _title: string;
    private _panel: WebviewPanel;
    private _context: ExtensionContext;
    protected _disposables: Disposable[] = [];

    constructor(context: ExtensionContext, uri: Uri, scheme: string, viewColumn: ViewColumn) {
        this._storage = context.workspaceState;
        this._uri = uri;
        this._context = context;
        this.initWebview(scheme, viewColumn);
    }

    private initWebview(scheme: string, viewColumn: ViewColumn) {
        let self = this;
        this._previewUri = this._uri.with({
            scheme: scheme
        });
        this._title = `Preview '${path.basename(this._uri.fsPath)}'`;
        this._panel = window.createWebviewPanel("gc-epublwebviewer", this._title, viewColumn, {
            enableScripts: true,
            enableCommandUris: true,
            enableFindWidget: true
        });
        this._panel.onDidDispose(() => {
            this.dispose();
        }, null, this._disposables);

        this._panel.onDidChangeViewState((e: WebviewPanelOnDidChangeViewStateEvent) => {
            //self._isActive = e.webviewPanel.visible;
            let active = e.webviewPanel.visible;
        }, null, this._disposables);

        this.webview.onDidReceiveMessage((e) => {
            if (e.error) {
                window.showErrorMessage(e.error);
            } else {
                switch (e.command) {
                    case "postToc":
                        window.showInformationMessage(e.toc);
                        break;
                }
            }
        }, null, this._disposables);
    }

    public update(content: string, options: any) {
        this.webview.html = this.html;
    }

    public getOptions(): any {
        return {
            uri: this.previewUri.toString(),
            state: this.state
        };
    }

    public configure() {
        let options = this.getOptions();
        this.webview.html = this.html;
        this.refresh();
    }

    public dispose() {
        this._panel.dispose();
        while (this._disposables.length) {
            const item = this._disposables.pop();
            if (item) {
                item.dispose();
            }
        }
    }

    public reveal() {
        this._panel.reveal();
    }
    
    get visible(): boolean {
        return this._panel.visible;
    }

    get webview(): Webview {
        return this._panel.webview;
    }

    get storage(): Memento {
        return this._storage;
    }
    
    get state(): any {
        return this.storage.get(this.previewUri.toString());
    }
    
    get theme(): string {
        return <string>workspace.getConfiguration('epub-preview').get("theme");        
    }
    
    get uri(): Uri {
        return this._uri;
    }

    get webViewUri() : Uri {
        return this._panel.webview.asWebviewUri(this.uri);
    }

    get previewUri(): Uri {
        return this._previewUri;
    }

    public resourceUri(resourceName: string): Uri {
        return this._panel.webview.asWebviewUri(Uri.file(path.join(this._context.extensionPath, 'resources', resourceName)));
    }
    
    abstract get html(): string;
    abstract refresh(): void;
}