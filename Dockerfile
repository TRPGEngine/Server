FROM node:14.15.1-alpine

LABEL maintainer=moonrailgun
LABEL description="TRPG Engine Docker Image"

WORKDIR /usr/src/app

# # 更新到最新版本的yarn
# RUN npm install -g yarn@latest

RUN echo "https://mirror.tuna.tsinghua.edu.cn/alpine/v3.4/main/" > /etc/apk/repositories
RUN echo "http://mirrors.aliyun.com/alpine/v3.8/main/" >> /etc/apk/repositories
RUN echo "http://mirrors.aliyun.com/alpine/v3.8/community/" >> /etc/apk/repositories

# 安装Bash
RUN apk update \
    && apk upgrade \
    && apk add --no-cache bash \
      bash-doc \
      bash-completion \
    && rm -rf /var/cache/apk/* \
    && /bin/bash

# 安装Python
RUN apk add --no-cache python2

# 安装git
RUN apk add --no-cache git

# 安装gcc
RUN apk add make
RUN apk add gcc musl-dev g++ zlib-dev


# node_module cache
COPY packages/foreach.sh ./packages/
COPY packages/Actor/package.json packages/Actor/yarn.lock ./packages/Actor/
COPY packages/Bot/package.json packages/Bot/yarn.lock ./packages/Bot/
COPY packages/Chat/package.json packages/Chat/yarn.lock ./packages/Chat/
COPY packages/ChatEmotion/package.json packages/ChatEmotion/yarn.lock ./packages/ChatEmotion/
COPY packages/Core/package.json packages/Core/yarn.lock ./packages/Core/
COPY packages/Dashboard/package.json packages/Dashboard/yarn.lock ./packages/Dashboard/
COPY packages/Deploy/package.json packages/Deploy/yarn.lock ./packages/Deploy/
COPY packages/Dice/package.json packages/Dice/yarn.lock ./packages/Dice/
COPY packages/File/package.json packages/File/yarn.lock ./packages/File/
COPY packages/Group/package.json packages/Group/yarn.lock ./packages/Group/
COPY packages/Help/package.json packages/Help/yarn.lock ./packages/Help/
COPY packages/Info/package.json packages/Info/yarn.lock ./packages/Info/
COPY packages/Mail/package.json packages/Mail/yarn.lock ./packages/Mail/
COPY packages/Note/package.json packages/Note/yarn.lock ./packages/Note/
COPY packages/Notify/package.json packages/Notify/yarn.lock ./packages/Notify/
# COPY packages/OAuth/package.json packages/OAuth/yarn.lock ./packages/OAuth/
COPY packages/Player/package.json packages/Player/yarn.lock ./packages/Player/
COPY packages/QQConnect/package.json packages/QQConnect/yarn.lock ./packages/QQConnect/
COPY packages/Report/package.json packages/Report/yarn.lock ./packages/Report/
COPY packages/TRPG/package.json packages/TRPG/yarn.lock ./packages/TRPG/
RUN bash packages/foreach.sh 'yarn install'

# 先安装子模块的依赖再安装外部依赖。因为每次升级外部package.json必然会丢失缓存
COPY package.json yarn.lock ./
RUN yarn install

COPY . .
# 再更新一遍防止上面没有缓存的包
RUN yarn install && yarn run packages:install

EXPOSE 23256

ENV NODE_ENV production
CMD yarn run pro
# CMD echo '测试'
