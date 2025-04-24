# TT_plot-code

vscode で TT(Tensor-Train)形式をプレビューする拡張機能

## 使い方

1. Release から`tt-plot-*.vsix`ファイルをダウンロード
2. vscode の`拡張機能`タブの`...`から`VSIXからのインストール`を選択

### ファイル形式

本拡張機能で開くことのできる形式は`.npz`形式です．\
python で，

```python
np.savez_compressed('test.npz', *tt.cores)
```

のようにして TT コアを npz ファイルで保存してください．

## 開発者向け

nodejs が必要です．

### 拡張機能をデバッグ

```bash
# 依存ライブラリをインストール
npm run install:all

# webviewをビルド
npm run build:webview
```

vscode 上で`F5`クリックでデバッグ開始

### VSIX ファイルを作成

```bash
# webviewをビルド
npm run build:webview
# パッケージ作成
npx vsce package
```

### フォルダ構成

-   src : 拡張機能本体のフォルダ
    -   `.npz`ファイルをクリックした時に webview を開く機能
    -   クリックされたファイルの中身を読み込み，webview に渡す機能
-   webview-ui : React で作成した webview のフォルダ
    -   渡されたデータを配列にし，プレビューする機能
