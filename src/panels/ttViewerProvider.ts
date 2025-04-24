import * as vscode from "vscode";

import { getNonce } from "../utilities/getNonce";
import { getUri } from "../utilities/getUri";
import { TTDocument } from "./ttDocument";

export class TTViewerProvider implements vscode.CustomReadonlyEditorProvider<TTDocument> {
    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        return vscode.window.registerCustomEditorProvider(
            TTViewerProvider.viewType,
            new TTViewerProvider(context),
            {
                webviewOptions: {
                    retainContextWhenHidden: true,
                },
                supportsMultipleEditorsPerDocument: false,
            }
        );
    }

    private static readonly viewType = "tt-plot.cores";

    /**
     * Tracks all known webviews
     */
    private readonly webviews = new WebviewCollection();

    constructor(private readonly _context: vscode.ExtensionContext) {}

    async openCustomDocument(
        uri: vscode.Uri,
        openContext: { backupId?: string }
    ): Promise<TTDocument> {
        return TTDocument.create(uri, openContext.backupId);
    }

    async resolveCustomEditor(
        document: TTDocument,
        webviewPanel: vscode.WebviewPanel
    ): Promise<void> {
        // Add the webview to our internal set of active webviews
        this.webviews.add(document.uri, webviewPanel);

        const extensionUri = this._context.extensionUri;
        // Setup initial content for the webview
        webviewPanel.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(extensionUri, "out"),
                vscode.Uri.joinPath(extensionUri, "webview-ui/build"),
            ],
        };
        webviewPanel.webview.html = this.getWebviewContent(webviewPanel.webview);

        webviewPanel.webview.onDidReceiveMessage((e) => this.onMessage(document, webviewPanel, e));
    }

    private getWebviewContent(webview: vscode.Webview) {
        const extensionUri = this._context.extensionUri;
        // The JS file from the React build output
        const scriptUri = getUri(webview, extensionUri, [
            "webview-ui",
            "build",
            "assets",
            "index.js",
        ]);

        const nonce = getNonce();

        // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
        return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
        </head>
        <body>
          <div id="root"></div>
          <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
        </body>
      </html>
    `;
    }

    private postMessage(panel: vscode.WebviewPanel, type: string, body: any): void {
        panel.webview.postMessage({ type, body });
    }

    private onMessage(document: TTDocument, webviewPanel: vscode.WebviewPanel, message: any) {
        switch (message.type) {
            case "ready": {
                this.postMessage(webviewPanel, "init", {
                    value: document.documentData,
                });

                break;
            }
            case "saveSvg": {
                const fn = async () => {
                    const uri = await vscode.window.showSaveDialog({
                        saveLabel: "Save SVG",
                        filters: { svg: ["svg"] },
                    });
                    vscode.workspace.getWorkspaceFolder(document.uri);
                    if (uri) {
                        const svgData = message.body;
                        const svgBlob = new Blob([svgData], { type: "image/svg+xml" });
                        const svgBuffer = await svgBlob.arrayBuffer();
                        await vscode.workspace.fs.writeFile(uri, new Uint8Array(svgBuffer));
                    }
                };
                fn().catch((err) => console.error(err));

                break;
            }
        }
    }
}

/**
 * Tracks all webviews.
 */
class WebviewCollection {
    private readonly webviews = new Set<{
        readonly resource: string;
        readonly webviewPanel: vscode.WebviewPanel;
    }>();

    /**
     * Get all known webviews for a given uri.
     */
    public *get(uri: vscode.Uri): Iterable<vscode.WebviewPanel> {
        const key = uri.toString();
        for (const entry of this.webviews) {
            if (entry.resource === key) {
                yield entry.webviewPanel;
            }
        }
    }

    /**
     * Add a new webview to the collection.
     */
    public add(uri: vscode.Uri, webviewPanel: vscode.WebviewPanel) {
        const entry = { resource: uri.toString(), webviewPanel };
        this.webviews.add(entry);

        webviewPanel.onDidDispose(() => {
            this.webviews.delete(entry);
        });
    }
}
