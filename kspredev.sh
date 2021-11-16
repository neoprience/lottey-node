#!/bin/bash

#appId 服务名称（唯一）
#branch 部署环境（dev-开发；release-测试；master-生产）
#replicas pod初始集群数量
#dcHost 数据中心域名 区分域名以便上层负载均衡分发不同环境，ks-曙光；hks-华三
#group 分组

appId=$1
branch=$2
replicas=$3
dcHost=$4
group="tfsmy-nodejs"

cat > process.yml << EOF
apps:
- name : ${appId}
  script: "./bin/www"
#多核部署需开启以下两个参数
#  instances: 0
#  exec_mode: "cluster"
  max_memory_restart: 1G
  log_date_format: "YYYY-MM-DD HH:mm:ss Z"
  error_file: "/logs/${appId}-err.log"
  out_file: "/logs/${appId}-out.log"
  log_file: "/logs/${appId}-all.log"
  combine_logs: true
  env:
    NODE_ENV: development
  env_production:
    NODE_ENV: production
EOF

[ -d ./deploy ] && echo "deploy dir exist" || mkdir deploy/{dev,release,master} -p
cat > deploy/${branch}/deploy.yaml << EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: nodejs
    component: ${appId}
    release: ${branch}
    tier: backend
  name: ${appId}
  namespace: ${group}
spec:
  progressDeadlineSeconds: 600
  replicas: ${replicas}
  selector:
    matchLabels:
      app: nodejs
      component: ${appId}
      release: ${branch}
      tier: backend
  template:
    metadata:
      labels:
        app: nodejs
        component: ${appId}
        release: ${branch}
        tier: backend
    spec:
      containers:
        - image: $REGISTRY/$DOCKERHUB_NAMESPACE/$APP_NAME:SNAPSHOT-$BUILD_NUMBER
          imagePullPolicy: Always
          name: ${appId}
          readinessProbe:
            tcpSocket:
              port: 3000
            timeoutSeconds: 10
            periodSeconds: 10
            successThreshold: 1
            failureThreshold: 3
          ports:
            - name: tcp-3000
              containerPort: 3000
              protocol: TCP
          resources:
            requests:
              cpu: 10m
              memory: 10Mi
          terminationMessagePath: /dev/termination-log
          terminationMessagePolicy: File
      restartPolicy: Always
      terminationGracePeriodSeconds: 30
      imagePullSecrets:
        - name: nexushub-id
EOF

cat > deploy/${branch}/deploy-svc.yaml << EOF
apiVersion: v1
kind: Service
metadata:
  labels:
    app: nodejs
    component: ${appId}
    release: ${branch}
    tier: backend
  name: ${appId}-svc
  namespace: ${group}
spec:
  ports:
    - name: http-3000
      port: 3000
      protocol: TCP
      targetPort: 3000
  selector:
    app: nodejs
    component: ${appId}
    release: ${branch}
    tier: backend
  type: ClusterIP
  sessionAffinity: ClientIP
  sessionAffinityConfig:
    clientIP:
      timeoutSeconds: 10800
EOF

cat > deploy/${branch}/deploy-ingress.yaml << EOF
kind: Ingress
apiVersion: extensions/v1beta1
metadata:
  name: ${appId}-ingress
  namespace: ${group}
  labels:
    app: nodejs
    component: ${appId}-ingress
    release: ${branch}
    tier: backend
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/proxy-body-size: 50m
    nginx.ingress.kubernetes.io/proxy-connect-timeout: '600'
    nginx.ingress.kubernetes.io/proxy-read-timeout: '600'
    nginx.ingress.kubernetes.io/proxy-send-timeout: '600'
    nginx.ingress.kubernetes.io/rewrite-target: /\$2
    nginx.ingress.kubernetes.io/use-regex: 'true'
spec:
  rules:
    - host: ${dcHost}
      http:
        paths:
          - path: /${appId}(/|$)(.*)
            backend:
              serviceName: ${appId}-svc
              servicePort: 3000
EOF
