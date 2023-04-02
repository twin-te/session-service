# session-service

セッションを管理します

# 環境変数

`.env` を見ると雰囲気がわかるので `.env.local` にコピーしてよしなに上書きしてください

# 推奨開発環境

docker + vscode を使うことで簡単に開発可能。

1. [RemoteDevelopment](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack)拡張機能をインストール
2. このプロジェクトのフォルダを開く
3. 右下に `Folder contains a Dev Container configuration file. Reopen folder to develop in a container` と案内が表示されるので`Reopen in Container`を選択する。（表示されない場合はコマンドパレットを開き`open folder in container`と入力する）
4. node14 の開発用コンテナが立ち上がり VSCode で開かれる。また、`.devcontainer/docker-compose.yml` に任意のサービスを追加すると vscode 起動時に一緒に起動できる（データベース等）。

# npm コマンド一覧

| コマンド | 説明                                                        |
| :------- | :---------------------------------------------------------- |
| dev      | 開発起動                                                    |
| proto    | proto ファイルから型定義を生成(proto-gen.sh を実行している) |
| schema   | prisma のスキーマから型定義を生成                           |
| apply-db | prisma のスキーマを破壊的にデータベースに適用する           |
| client   | grpc リクエストが送れる CLI を起動                          |
| test     | テストを実行                                                |
| build    | dist にビルド結果を出力                                     |

# とりあえず動かす

```bash
# 準備
$ yarn && yarn proto && yarn migrate:dev

# テスト（テストが通ればとりあえずOK）
$ yarn test

# 開発鯖立ち上げ
$ yarn dev

```
