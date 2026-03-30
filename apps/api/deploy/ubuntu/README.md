# Ubuntu 部署（仅 API）

这个目录提供 `apps/api` 的 Ubuntu 裸机部署脚本，默认使用：

- `systemd` 守护 Node.js API
- `/opt/md2weixin-api` 作为发布根目录
- `releases/current/shared` 三段式目录布局

目录结构：

```text
/opt/md2weixin-api/
  releases/<timestamp>/
  current -> releases/<timestamp>
  shared/env/production.env
```

## 前置依赖

服务器至少需要安装：

```bash
sudo apt update
sudo apt install -y curl git rsync
```

另外需要提前具备：

- Node.js
- pnpm
- `systemd`
- 有 `sudo` 权限的部署用户

## 首次部署

在仓库根目录执行：

```bash
bash apps/api/deploy/ubuntu/install.sh
```

脚本会自动完成：

- 创建 `/opt/md2weixin-api/releases` 与 `/opt/md2weixin-api/shared/env`
- 若共享环境文件不存在，则用 `apps/api/env/production.env` 初始化
- 把当前仓库同步到新的 release 目录
- 执行 `pnpm install --frozen-lockfile`
- 执行 `pnpm --dir apps/api build`
- 安装 `md2weixin-api` 的 `systemd` 服务
- 更新 `current` 软链并重启服务

其中 `systemd` 单元会在部署时写入部署用户的 `NVM_DIR`，并通过 `nvm which default` 启动默认 Node 版本，避免把 `.nvm` 下的具体版本号写死在服务文件里。

首次执行后，请立即编辑共享环境文件：

```bash
sudoedit /opt/md2weixin-api/shared/env/production.env
sudo systemctl restart md2weixin-api
```

## 后续更新

服务器上的常规更新流程：

```bash
cd /path/to/md2weixin
git pull
bash apps/api/deploy/ubuntu/install.sh
```

脚本是可重复执行的；如果构建失败，不会切换 `current` 到新版本。

## systemd

服务名固定为：

```bash
md2weixin-api
```

常用命令：

```bash
sudo systemctl status md2weixin-api --no-pager
sudo journalctl -u md2weixin-api -n 100 --no-pager
sudo systemctl restart md2weixin-api
```

## 验证

服务启动后，可用下面的命令验证：

```bash
curl -X POST http://127.0.0.1:8081/api/wx-md \
  -H "Content-Type: application/json" \
  -d '{"markdown":"## 示例\n\n这是一个示例","theme":"chengxin","font":"cx"}'
```
