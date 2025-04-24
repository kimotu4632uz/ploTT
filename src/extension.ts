import { ExtensionContext } from "vscode";

import { TTViewerProvider } from "./panels/ttViewerProvider";

export function activate(context: ExtensionContext) {
    // ファイルビューアを登録
    context.subscriptions.push(TTViewerProvider.register(context));
}
