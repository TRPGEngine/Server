FROM node:10 AS stage-one

# Install DEB dependencies and others.
RUN \
	set -x \
	&& apt-get update \
	&& apt-get install -y net-tools build-essential valgrind

WORKDIR /service

COPY package.json .
RUN npm install --registry=https://registry.npm.taobao.org
COPY server.ts .
COPY config.js .
COPY tsconfig.json .
COPY lib lib

# provide by host
# COPY certs certs

CMD npm run start
