#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../../.." && pwd)"

APP_NAME="${APP_NAME:-md2weixin-api}"
SERVICE_NAME="${SERVICE_NAME:-md2weixin-api}"
INSTALL_ROOT="${INSTALL_ROOT:-/opt/md2weixin-api}"
RUN_USER="${DEPLOY_USER:-${SUDO_USER:-$(id -un)}}"
RUN_GROUP="${DEPLOY_GROUP:-$(id -gn "${RUN_USER}")}"
RELEASE_ID="$(date +%Y%m%d%H%M%S)"
RELEASE_DIR="${INSTALL_ROOT}/releases/${RELEASE_ID}"
CURRENT_LINK="${INSTALL_ROOT}/current"
SHARED_ENV_DIR="${INSTALL_ROOT}/shared/env"
SHARED_ENV_FILE="${SHARED_ENV_DIR}/production.env"
SERVICE_TEMPLATE="${SCRIPT_DIR}/md2weixin-api.service"
SERVICE_TARGET="/etc/systemd/system/${SERVICE_NAME}.service"

log() {
  printf '[%s] %s\n' "${APP_NAME}" "$*"
}

run_root() {
  if [ "$(id -u)" -eq 0 ]; then
    "$@"
  else
    sudo "$@"
  fi
}

require_command() {
  local cmd="$1"
  if ! command -v "${cmd}" >/dev/null 2>&1; then
    printf '缺少依赖命令: %s\n' "${cmd}" >&2
    exit 1
  fi
}

ensure_prereqs() {
  require_command node
  require_command pnpm
  require_command rsync
  require_command systemctl
}

prepare_dirs() {
  run_root mkdir -p "${INSTALL_ROOT}/releases" "${SHARED_ENV_DIR}"
  run_root chown -R "${RUN_USER}:${RUN_GROUP}" "${INSTALL_ROOT}"
}

ensure_shared_env() {
  if [ -f "${SHARED_ENV_FILE}" ]; then
    return
  fi

  log "初始化共享环境文件: ${SHARED_ENV_FILE}"
  cp "${REPO_ROOT}/apps/api/env/production.env" "${SHARED_ENV_FILE}"
}

sync_release() {
  log "同步仓库到 release: ${RELEASE_DIR}"
  mkdir -p "${RELEASE_DIR}"
  rsync -a \
    --exclude '.git' \
    --exclude 'node_modules' \
    --exclude '.pnpm-store' \
    --exclude 'apps/api/dist' \
    --exclude 'apps/web/dist' \
    --exclude '.DS_Store' \
    "${REPO_ROOT}/" "${RELEASE_DIR}/"
}

link_shared_env() {
  rm -f "${RELEASE_DIR}/apps/api/env/production.env"
  ln -s "${SHARED_ENV_FILE}" "${RELEASE_DIR}/apps/api/env/production.env"
}

build_release() {
  log "安装 workspace 依赖"
  (
    cd "${RELEASE_DIR}"
    pnpm install --frozen-lockfile
    pnpm --dir apps/api build
  )
}

render_systemd_service() {
  local temp_file
  temp_file="$(mktemp)"

  sed \
    -e "s|__RUN_USER__|${RUN_USER}|g" \
    -e "s|__RUN_GROUP__|${RUN_GROUP}|g" \
    -e "s|__WORKING_DIRECTORY__|${CURRENT_LINK}/apps/api|g" \
    "${SERVICE_TEMPLATE}" >"${temp_file}"

  run_root cp "${temp_file}" "${SERVICE_TARGET}"
  rm -f "${temp_file}"
}

switch_current_release() {
  ln -sfn "${RELEASE_DIR}" "${CURRENT_LINK}"
}

restart_service() {
  log "安装并重启 systemd 服务: ${SERVICE_NAME}"
  run_root systemctl daemon-reload
  run_root systemctl enable "${SERVICE_NAME}"
  run_root systemctl restart "${SERVICE_NAME}"
}

show_next_steps() {
  log "部署完成，当前版本: ${RELEASE_DIR}"
  log "环境文件: ${SHARED_ENV_FILE}"
  log "服务状态命令: sudo systemctl status ${SERVICE_NAME} --no-pager"
  log "日志查看命令: sudo journalctl -u ${SERVICE_NAME} -n 100 --no-pager"
  log "接口自测示例:"
  cat <<'EOF'
curl -X POST http://127.0.0.1:8081/api/wx-md \
  -H "Content-Type: application/json" \
  -d '{"markdown":"## 示例\n\n这是一个示例","theme":"chengxin","font":"cx"}'
EOF
}

main() {
  ensure_prereqs
  prepare_dirs
  ensure_shared_env
  sync_release
  link_shared_env
  build_release
  render_systemd_service
  switch_current_release
  restart_service
  show_next_steps
}

main "$@"
