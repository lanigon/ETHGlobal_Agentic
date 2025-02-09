# 使用 Python 3.12 基础镜像
FROM python:3.12-slim AS python_stage

# 安装必要的依赖
RUN apt-get update && apt-get install -y gcc libpq-dev

# 设置工作目录
WORKDIR /app

# 复制并安装 Python 相关依赖
COPY ./agent.py_runtime/requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install git+https://github.com/l1cacheDell/swarm.git

# 使用 Node.js 16 镜像，并安装 pnpm
FROM node:23-slim AS node_stage

# 安装 pnpm
RUN npm install -g pnpm

# 设置工作目录
WORKDIR /app

# 复制并安装 Node 相关依赖（TypeScript 项目）
COPY ./agent.node_runtime/package.json ./agent.node_runtime/pnpm-lock.yaml /app/
RUN pnpm install --frozen-lockfile

# 编译 TypeScript
COPY ./agent.node_runtime /app/
# RUN pnpm build --prefix agent.node_runtime

# 复制 Python 依赖安装的结果
COPY --from=python_stage /app /app

# 使用 supervisord 或启动脚本启动两个服务
# 安装 supervisord
RUN apt-get update && apt-get install -y supervisor

# 配置 supervisord 以启动两个服务
COPY ./supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# 暴露 FastAPI 端口
EXPOSE 8080

# 启动 supervisord
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
