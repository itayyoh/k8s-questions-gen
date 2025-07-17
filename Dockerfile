FROM golang:1.24.5-bookworm AS go-build

WORKDIR /backend

COPY backend/go.mod backend/go.sum ./

RUN go mod download

COPY backend/ .

RUN go build -o main .


FROM node:24-alpine3.21 AS node-build

WORKDIR /frontend

COPY frontend/package.json frontend/package-lock.json ./

RUN npm install 

COPY frontend/ .

RUN npm run build

FROM nginx:alpine

RUN apk add --no-cache supervisor

COPY --from=go-build /backend/main /usr/local/bin/backend

COPY --from=node-build /frontend/build /usr/share/nginx/html

