# FROM node:8.11-alpine
# 因为node-image 不支持linux_musl 因此只能使用完整linux环境
FROM node:8.11

LABEL maintainer=moonrailgun
LABEL description="TRPG Engine Docker Image"

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

WORKDIR /usr/src/app
COPY . .
RUN npm install && npm run packages:install
EXPOSE 23256

ENV NODE_ENV production
CMD npm run pro
# CMD echo '测试'
