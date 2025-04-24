import * as vscode from "vscode";

export function disposeAll(disposables: vscode.Disposable[]): void {
    while (disposables.length) {
        const item = disposables.pop();
        if (item) {
            item.dispose();
        }
    }
}

export abstract class Disposable {
    protected isDisposed = false;

    protected disposables: vscode.Disposable[] = [];

    public dispose(): any {
        if (this.isDisposed) {
            return;
        }
        this.isDisposed = true;
        disposeAll(this.disposables);
    }

    protected register<T extends vscode.Disposable>(value: T): T {
        if (this.isDisposed) {
            value.dispose();
        } else {
            this.disposables.push(value);
        }
        return value;
    }
}
