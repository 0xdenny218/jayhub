# plushub4deliver · 站台交付說明

甲方在自己的網域部署 AI 模型閘道，向終端使用者核發 API 金鑰，並管理使用者、售價、額度與退款。站台使用供應方分配給甲方的上游金鑰轉送請求。供應方依其平台上甲方帳戶的帳單與甲方獨立結算。

## 接手與部署

交付版 Compose 會從本儲存庫建置網頁及 API 服務，並啟動 PostgreSQL 和 Redis。以下兩份手冊為簡體中文。

- 部署三項服務、設定 HTTPS、初始化管理員，以及備份和升級。[單機部署與維運](./delivery/DEPLOYMENT.zh-CN.md) · [交付版 Compose](./delivery/compose.yaml)
- 接收上游憑證、設定渠道和售價、驗收模型呼叫及帳單。[甲方交付手冊](./delivery/甲方交付手册.md)

## 公開頁面

- **首頁（`/`）** 可依模型名稱或供應商搜尋，依文字、圖片或影片篩選，點選模型卡片即可查看定價。目錄的可見範圍依模型廣場設定而定。[首頁截圖，含示範模型與價格](./assets/screenshots/delivery-home.zh-CN.png)
- **登入頁（`/sign-in`）** 左上角顯示站台名稱與標誌，中央為單欄表單。開啟密碼登入後，使用者可輸入使用者名稱或電子郵件與密碼。註冊及其他登入方式依後台設定顯示。[登入頁截圖](./assets/screenshots/delivery-sign-in.zh-CN.png)

## 版權與署名

本交付版以 [New API](https://github.com/QuantumNous/new-api) `v1.0.0-rc.51` 為基礎。Copyright (c) QuantumNous and contributors. 頁尾保留原始專案連結與下列署名。

> Frontend design and development by New API contributors.

本專案採用 GNU AGPLv3 授權。[LICENSE](./LICENSE) · [NOTICE](./NOTICE) · [第三方授權](./THIRD-PARTY-LICENSES.md)
