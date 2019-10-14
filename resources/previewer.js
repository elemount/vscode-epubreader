class EpubPreviewer {
    constructor(file) {
        this.file = file;
        this.vscode = acquireVsCodeApi();
        this.book = ePub(this.file, { openAs: "epub" });
    }

    async show(domId) {
        await this.book.ready;
        this.rendition = this.book.renderTo(domId, { method: "default", width: "100%", height: "100%" });
        await this.rendition.display();
    }

    async postToc() {
        var nav = await this.book.loaded.navigation;
        this.vscode.postMessage({
            command : "postToc",
            toc: nav.toc
        });
    }

    async postLocation() {
        this.vscode.postMessage({
            command : "postLocation",
            location: this.rendition.location
        });
    }
}