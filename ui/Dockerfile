FROM node:16
ARG appdir=/usr/src/app
ARG builddir=/usr/src/app/server
WORKDIR $appdir
COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .
RUN npm run build
RUN mv build server/public
WORKDIR $builddir