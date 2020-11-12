FROM node:10.19.0-alpine

LABEL maintainer=moonrailgun
LABEL description="TRPG Engine Docker Image"

WORKDIR /usr/src/app

# 更新到最新版本的npm
RUN npm install -g npm@latest

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
COPY packages/Actor/package.json packages/Actor/package-lock.json ./packages/Actor/
COPY packages/Bot/package.json packages/Bot/package-lock.json ./packages/Bot/
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
COPY packages/TRPG/package.json packages/TRPG/package-lock.json ./packages/TRPG/
RUN bash packages/foreach.sh 'npm ci'

# 先安装子模块的依赖再安装外部依赖。因为每次升级外部package.json必然会丢失缓存
COPY package.json package-lock.json ./
RUN npm install

COPY . .
# 再更新一遍防止上面没有缓存的包
RUN npm install && npm run packages:install

EXPOSE 23256

ENV NODE_ENV production
CMD npm run pro
# CMD echo '测试'
