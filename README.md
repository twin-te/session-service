# session-service

セッションを管理します

# 環境変数

`.env` を見ると雰囲気がわかるので `.env.local` にコピーしてよしなに上書きしてください

# 推奨開発環境
docker + vscode を使うことで簡単に開発可能。

1. [RemoteDevelopment](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack)拡張機能をインストール
2. このプロジェクトのフォルダを開く
3. 右下に `Folder contains a Dev Container configuration file. Reopen folder to develop in a container` と案内が表示されるので`Reopen in Container`を選択する。（表示されない場合はコマンドパレットを開き`open folder in container`と入力する）
4. node14の開発用コンテナが立ち上がりVSCodeで開かれる。また、`.devcontainer/docker-compose.yml` に任意のサービスを追加するとvscode起動時に一緒に起動できる（データベース等）。

# npmコマンド一覧

|コマンド|説明|
|:--|:--|
|dev| 開発起動|
|proto|protoファイルから型定義を生成(proto-gen.shを実行している)|
|schema|prisma のスキーマから型定義を生成|
|apply-db|prisma のスキーマを破壊的にデータベースに適用する|
|client|grpcリクエストが送れるCLIを起動|
|test|テストを実行|
|build|distにビルド結果を出力|

# とりあえず動かす
```bash
# 準備
yarn && yarn proto && yarn apply-db

# 開発鯖立ち上げ
yarn dev

```