FROM alpine:3.9
ARG appdir=/usr/src/app
ARG builddir=$appdir/build
RUN apk add --update bash npm mongodb nano
RUN mkdir -p $appdir
WORKDIR $appdir
COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .
RUN npm run build
COPY .env build/.env
WORKDIR $builddir