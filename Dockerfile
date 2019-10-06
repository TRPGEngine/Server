FROM node:8.11-alpine
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --silent && npm run packages:install
COPY . .
EXPOSE 23256
CMD npm pro
