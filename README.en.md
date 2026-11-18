# plushub4deliver · Operator guide

The customer deploys this AI gateway on their own domain, issues API keys to end users, sets retail prices, and handles refunds. The gateway forwards requests using the customer's upstream key. The supplier bills the customer separately for usage recorded on the supplier's platform.

## Deployment and handover

The delivery Compose file builds the branded web and API service from this repository and starts PostgreSQL and Redis. The two guides are available in Simplified Chinese.

- Deploy the three services, configure HTTPS, initialize the administrator, and back up or upgrade the site. [Deployment guide](./delivery/DEPLOYMENT.zh-CN.md) · [Delivery Compose file](./delivery/compose.yaml)
- Receive the upstream credentials, configure channels and pricing, and verify calls and billing. [Customer handover manual](./delivery/甲方交付手册.md)

## Public pages

- **Home (`/`).** Users search the model directory by model or provider, filter by text, image, or video, and open a model's pricing details. Visibility follows the site's model marketplace settings. [Home preview with sample models and prices](./assets/screenshots/delivery-home.zh-CN.png)
- **Sign in (`/sign-in`).** A centered form displays the site's branding. When password sign-in is enabled, users sign in with a username or email address and a password. Registration and other sign-in options follow the administrator's settings. [Sign-in preview](./assets/screenshots/delivery-sign-in.zh-CN.png)

## Copyright and attribution

This edition is based on [New API](https://github.com/QuantumNous/new-api) `v1.0.0-rc.51`. Copyright (c) QuantumNous and contributors. The site footer links to the upstream project and retains the attribution below.

> Frontend design and development by New API contributors.

The project is licensed under GNU AGPLv3. [LICENSE](./LICENSE) · [NOTICE](./NOTICE) · [Third-party licenses](./THIRD-PARTY-LICENSES.md)
