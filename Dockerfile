FROM node:8.11-alpine
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
COPY . .
RUN npm install --silent && npm run packages:install
EXPOSE 23256
CMD npm run pro
