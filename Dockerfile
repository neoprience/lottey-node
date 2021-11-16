############################################
#                 构建阶段
############################################
FROM repo.svc.tfsmy:30818/nodejs-pm2-8.16.2-smybase-alpin:v2 as build
WORKDIR /build
COPY package.json ./
ARG NPM_IP
ARG NPM_HOST
RUN apk add --update git \
    && echo "${NPM_IP} ${NPM_HOST}" >> /etc/hosts \
    && npm config set sass-binary-site https://npm.taobao.org/mirrors/node-sass \
    && npm install


############################################
#        运行时，也即最终的 Image 内容
############################################
FROM repo.svc.tfsmy:30818/nodejs-pm2-8.16.2-smybase-alpin:v2 as runtime
RUN mkdir -p /{app,logs}
WORKDIR /app
COPY --from=build /build/node_modules /app/node_modules/
COPY . /app
#可构建时外部传递 --build-arg
#ks内传递 $APP_NAME 命令变量
ARG SERVICE_NAME
#Apollo地址
ARG APOLLO_URL
RUN if [ -f "gulpfile.js" ] ; then gulp --force ; fi
RUN if [[ -f "frontend/build/build.js" ]] || [[ -f "vue.config.js" ]] || [[ -f "build/build.js" ]] ; then npm run build --force ; fi

#构建时改变环境变量
ENV SERVICE_NAME=${SERVICE_NAME} \
    APOLLO_URL=${APOLLO_URL}
RUN npm config set color false \
    && node preload.js ${SERVICE_NAME} ${APOLLO_URL} \
    && /bin/sh kspredev.sh
CMD ["pm2-runtime", "process.yml"]