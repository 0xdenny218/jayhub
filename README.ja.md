# jayhub · 導入・運用ガイド

本システムは、自社ドメインで運用できる AI モデルゲートウェイです。運営者は利用者向けの API キーを発行し、料金、利用枠、返金を管理します。モデルへのリクエストは、供給元が運営者に発行した上流 API キーで転送します。供給元は自社プラットフォームで記録した運営者アカウントの利用分を別途請求します。

## 導入と引き継ぎ

納品用の Compose ファイルは、このリポジトリのソースからウェブ・API サービスをビルドし、PostgreSQL と Redis を起動します。以下の手順書は簡体字中国語です。

- 3 サービスの起動、HTTPS の設定、管理者の初期設定、バックアップとアップグレード。[導入・運用手順書](./delivery/DEPLOYMENT.zh-CN.md) · [納品用 Compose ファイル](./delivery/compose.yaml)
- 上流 API キーの受け取り、チャネルと料金の設定、モデル呼び出しと請求記録の照合。[引き継ぎ手順書](./delivery/甲方交付手册.md)

## 利用者向け画面

- **ホーム（`/`）** では、モデル名や提供元で検索し、テキスト・画像・動画で絞り込めます。カードから個別の料金を確認できます。カタログの公開範囲は管理画面の設定に従います。[サンプルのモデルと料金を表示したホーム画面](./assets/screenshots/delivery-home.zh-CN.png)
- **ログイン画面（`/sign-in`）** では、左上にサイトのロゴと名前、中央にログインフォームを表示します。パスワード認証が有効な場合は、ユーザー名またはメールアドレスとパスワードでログインできます。登録やその他の認証方法は管理者が設定します。[ログイン画面](./assets/screenshots/delivery-sign-in.zh-CN.png)

## 著作権とクレジット

本バージョンは [New API](https://github.com/QuantumNous/new-api) `v1.0.0-rc.51` をベースにしています。Copyright (c) QuantumNous and contributors. フッターには元のプロジェクトへのリンクと、以下のクレジットを記載しています。

> Frontend design and development by New API contributors.

本プロジェクトのライセンスは GNU AGPLv3 です。[LICENSE](./LICENSE) · [NOTICE](./NOTICE) · [サードパーティーライセンス](./THIRD-PARTY-LICENSES.md)
