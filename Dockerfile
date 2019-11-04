# FROM node:8.11-alpine
# 因为node-image 不支持linux_musl 因此只能使用完整linux环境
FROM node:8.11

LABEL maintainer=moonrailgun
LABEL description="TRPG Engine Docker Image"

WORKDIR /usr/src/app

# 更新到最新版本的npm
RUN npm install -g npm@latest

# RUN echo "https://mirror.tuna.tsinghua.edu.cn/alpine/v3.4/main/" > /etc/apk/repositories

# 安装Bash
# RUN apk update \
#     && apk upgrade \
#     && apk add --no-cache bash \
#       bash-doc \
#       bash-completion \
#     && rm -rf /var/cache/apk/* \
#     && /bin/bash

# 安装git
# RUN apk add --no-cache git

# node_module cache
COPY package.json package-lock.json ./
COPY packages/foreach.sh ./packages/
COPY packages/Actor/package.json packages/Actor/package-lock.json ./packages/Actor/
COPY packages/Chat/package.json packages/Chat/package-lock.json ./packages/Chat/
COPY packages/ChatEmotion/package.json packages/ChatEmotion/package-lock.json ./packages/ChatEmotion/
COPY packages/Core/package.json packages/Core/package-lock.json ./packages/Core/
COPY packages/Dashboard/package.json packages/Dashboard/package-lock.json ./packages/Dashboard/
COPY packages/Deploy/package.json packages/Deploy/package-lock.json ./packages/Deploy/
COPY packages/Dice/package.json packages/Dice/package-lock.json ./packages/Dice/
COPY packages/File/package.json packages/File/package-lock.json ./packages/File/
COPY packages/Group/package.json packages/Group/package-lock.json ./packages/Group/
COPY packages/Help/package.json packages/Help/package-lock.json ./packages/Help/
COPY packages/Info/package.json packages/Info/package-lock.json ./packages/Info/
COPY packages/Mail/package.json packages/Mail/package-lock.json ./packages/Mail/
COPY packages/Note/package.json packages/Note/package-lock.json ./packages/Note/
COPY packages/Notify/package.json packages/Notify/package-lock.json ./packages/Notify/
# COPY packages/OAuth/package.json packages/OAuth/package-lock.json ./packages/OAuth/
COPY packages/Player/package.json packages/Player/package-lock.json ./packages/Player/
COPY packages/QQConnect/package.json packages/QQConnect/package-lock.json ./packages/QQConnect/
COPY packages/Report/package.json packages/Report/package-lock.json ./packages/Report/
COPY packages/Website/package.json packages/Website/package-lock.json ./packages/Website/
COPY packages/Website/website/package.json packages/Website/website/package-lock.json ./packages/Website/website/

RUN npm install && npm run packages:install

COPY . .
# 再更新一遍防止上面没有缓存的包
RUN npm install && npm run packages:install

EXPOSE 23256

ENV NODE_ENV production
CMD npm run pro
# CMD echo '测试'
