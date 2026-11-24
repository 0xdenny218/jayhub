# jayhub 单机部署与运维

首次获取源码时，请联系供货方运营确认交付版本及上游渠道。按[甲方交付手册](./甲方交付手册.md)从 jayhub 仓库克隆指定版本。

从交付包根目录执行本文命令。配套的 [Compose 文件](./compose.yaml) 启动三个容器。`app` 提供网页和 API，`postgres` 保存账号、渠道和账单，`redis` 提供缓存。应用镜像由交付源码构建，包含定制首页和站点品牌。交付版使用本页配套文件；根目录的通用 Compose 默认拉取上游镜像。

## 1. 准备服务器

准备一台安装了 Docker Engine、Docker Compose 插件和 OpenSSL 的 Linux 服务器，以及一个已解析到服务器的 HTTPS 域名。首次构建需要能够下载基础镜像、Go 模块和前端依赖。宿主机 3000 端口须可用。

以下假定交付源码位于 `/opt/jayhub`，HTTPS 反向代理运行在同一台宿主机。把域名转发到 `http://127.0.0.1:3000`，保留请求的 Host 和原始 HTTPS 协议。代理应支持流式响应，使用 Nginx 时对 API 路径关闭响应缓冲。首次初始化完成前，将域名访问限制在运维人员范围内。

构建目录使用干净的交付源码，包含 `delivery/site.json`、`web/`、`relaykit/` 和 `tokenkit/`。运行密钥、数据库文件、日志和备份存放在源码目录外。

### 从 plushub4deliver 升级

已有实例请先备份，沿用原部署目录、原 `deploy.env` 和原 Compose 项目名。原版按手册安装时，配置文件是 `~/.config/plushub4deliver/deploy.env`，项目名是 `plushub4deliver`。在原源码目录更新至本次交付版本后，使用下面的命令重建服务，即可继续挂载原 PostgreSQL、Redis 和应用数据卷。曾通过 `-p` 自定义项目名的实例，请换成自己的项目名。

```sh
cd /opt/plushub4deliver
docker compose -p plushub4deliver --env-file "$HOME/.config/plushub4deliver/deploy.env" -f delivery/compose.yaml up -d --build
```

新装实例显示 BrainButter AI。已保存的旧默认站名和图标在升级时自动采用新品牌，自定义站名和图标继续生效。

## 2. 首次生成配置

将下面的 `https://gateway.example.com` 换成浏览器实际访问的 HTTPS 地址。填写协议、主机和必要的端口，例如 `https://api.example.com:8443`，省略路径和末尾斜杠。在有权写入部署目录的运维账号下执行一次。

```sh
cd /opt/jayhub
(
  set -euC
  umask 077
  mkdir -p "$HOME/.config/jayhub"
  {
    echo 'SITE_ORIGIN=https://gateway.example.com'
    echo 'COMPOSE_PROJECT_NAME=jayhub'
    for key in POSTGRES_PASSWORD REDIS_PASSWORD SESSION_SECRET CRYPTO_SECRET; do
      value=$(openssl rand -hex 32)
      printf '%s=%s\n' "$key" "$value"
    done
  } > "$HOME/.config/jayhub/deploy.env"
)
```

配置文件位于 `~/.config/jayhub/deploy.env`。重复执行会拒绝覆盖已有文件。升级和恢复时使用同一份密钥；已有 PostgreSQL 数据卷的密码轮换需要同时更新数据库角色和应用配置。

## 3. 构建并启动

在交付源码根目录执行。下面的 `dc` 是当前 shell 的简写，打开新终端后重新定义即可。

```sh
cd /opt/jayhub
dc() { docker compose --env-file "$HOME/.config/jayhub/deploy.env" -f delivery/compose.yaml "$@"; }
dc config --quiet
dc up -d --build
dc ps
curl -fsS http://127.0.0.1:3000/api/status
```

等待三个服务都显示 `healthy`。本机状态接口应返回 `"success":true`，首次部署的 `data.system_name` 应为 `BrainButter AI`。首轮编译需要一些时间；启动异常时运行 `dc logs --tail=100 app postgres redis`。对外入口是 HTTPS 域名，PostgreSQL 和 Redis 仅在 Compose 内部网络提供服务。

## 4. 初始化与业务验收

控制台默认提供只读渠道页面，管理员可以查看渠道状态和配置摘要。需要通过控制台维护时，在 `deploy.env` 中设置 `CHANNEL_MANAGEMENT_ENABLED=true`，再执行 `dc up -d --no-build --no-deps app`，用现有镜像重建应用容器以应用环境变量。直接运行二进制的实例可在应用的 `.env` 中设置该变量，再重启进程。刷新控制台后，页面按 `/api/status` 中的 `channel_management_enabled` 显示管理操作，管理接口按同一开关和原有权限放行。

1. 打开站点域名，按初始化向导创建甲方自己的管理员账号，选择「对外运营」模式。
2. 在「系统设置 → 站点」填写甲方对外地址并核对站名、Logo。使用需要生成任务产物链接的图片或视频渠道时，核对任务公开地址，使终端用户能够从公网取回结果。
3. 由持有数据库运维权限的人员配好 PlusHub 渠道。渠道配置需要包含供货方提供的网关 Base URL、**分配给甲方的上游 API Key**、已开通的模型和分组。若直接写数据库，在同一事务中维护 `channels` 和对应的 `abilities`，提交后重启应用以重新加载渠道缓存。普通 OpenAI 兼容渠道会把请求路径拼到 Base URL 上。例如最终接口为 `https://upstream.example.com/v1/chat/completions` 时，渠道地址填写 `https://upstream.example.com`。
4. 在本站配置面向终端用户的模型价格、分组倍率和额度。创建普通验收账号并签发**本站用户令牌**，以该令牌调用甲方域名。甲方按本站用量向用户收费和处理退款，供货方按其平台上甲方账号的账单结算。
5. 用双方约定的一个文本模型完成一次小额调用，核对本站用量记录和供货方的甲方账号记录。若开通图片或视频，再各验收一个模型。异步任务需要验证提交、状态查询和结果下载。成功后再向终端用户开放注册或分发令牌。

## 5. 日常运维与备份

| 操作 | 命令 |
| --- | --- |
| 查看服务状态 | `dc ps` |
| 跟踪应用日志 | `dc logs -f --tail=100 app` |
| 重启应用 | `dc restart app` |
| 停止 / 恢复现有服务 | `dc stop` / `dc start` |
| 升级交付版本 | 备份后，将源码更新为新交付版本，执行 `dc up -d --build`，再做第 3、4 节的验收 |

数据库逻辑备份示例。选择一个备份文件尚不存在的时点执行，并将成功生成的备份移交到独立存储。

```sh
umask 077
mkdir -p "$HOME/jayhub-backups"
dc exec -T postgres pg_dump -U plushub -d plushub -Fc > "$HOME/jayhub-backups/postgres-$(date +%Y%m%d-%H%M%S).dump"
```

`pg_data` 保存数据库，`app_data` 保存应用文件及文件日志，`redis_data` 保存 Redis 持久化数据。备份计划应包含这些卷和单独保管的 `deploy.env`，并在隔离环境验证恢复。升级可能迁移数据库，回滚前核对应用和数据库备份的版本。运维时保留数据卷，`docker compose down -v` 会删除项目卷。
