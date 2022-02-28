FROM node:16
ARG appdir=/usr/src/app
ARG builddir=$appdir/build
WORKDIR $appdir
COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .
RUN npm run build
COPY .env build/.env
WORKDIR $builddir