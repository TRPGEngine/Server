FROM node:10 AS stage-one

# Install DEB dependencies and others.
RUN \
	set -x \
	&& apt-get update \
	&& apt-get install -y net-tools build-essential valgrind

WORKDIR /service

COPY package.json .
RUN npm install --registry=https://registry.npm.taobao.org
COPY server.js .
COPY config.js .
COPY lib lib
# provide by host
# COPY certs certs

CMD ["ts-node", "/service/server.js"]
