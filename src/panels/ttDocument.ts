import * as vscode from "vscode";

import { Disposable } from "./dispose";

export class TTDocument extends Disposable implements vscode.CustomDocument {
    static async create(
        uri: vscode.Uri,
        backupId: string | undefined
    ): Promise<TTDocument | PromiseLike<TTDocument>> {
        // If we have a backup, read that. Otherwise read the resource from the workspace
        const dataFile = typeof backupId === "string" ? vscode.Uri.parse(backupId) : uri;
        const fileData = await TTDocument.readFile(dataFile);
        return new TTDocument(uri, fileData);
    }

    private static async readFile(uri: vscode.Uri): Promise<Uint8Array> {
        return new Uint8Array(await vscode.workspace.fs.readFile(uri));
    }

    readonly uri: vscode.Uri;

    readonly documentData: Uint8Array;

    private constructor(uri: vscode.Uri, initialContent: Uint8Array) {
        super();
        this.uri = uri;
        this.documentData = initialContent;
    }

    private readonly onDidDisposeEvent = this.register(new vscode.EventEmitter<void>());
    /**
     * Fired when the document is disposed of.
     */
    public readonly onDidDispose = this.onDidDisposeEvent.event;

    /**
     * Called by VS Code when there are no more references to the document.
     *
     * This happens when all editors for it have been closed.
     */
    dispose(): void {
        this.onDidDisposeEvent.fire();
        super.dispose();
    }
}
