# Helloworld

A Helloworld application implemented in node js using express. Best suited for
testing network topologies.

Current version: 0.0.5

## Environment variables

|     Variable      |  Description          | Default            |
| ----------------- | --------------------- | ------------------ |
| SERVER\_PORT      | HTTP Listen Port      | 80                 |
| SERVER\_SSL\_PORT | HTTPS Listen Port     | None               |
| SSL\_KEY          | Path to SSL Key       | None               |
| SSL\_CERT         | Path to SSL Cert      | None               |
| SERVICE\_VERSION  | Arbitary string       | 0                  |
| HOSTNAME          | Arbitary string       | localhost          |
| REGION            | Arbitary string       | local              |
| ZONE              | Arbitary string       | local-0            |

## Endpoints

### /

Always returns `Hello World!\n`

### /version

Useful if Helloworld has multiple backends. `version` can be tailored using
environmentment variables to indicate which backend is being hit.

Returns `version: $SERVICE_VERSION, zone: $ZONE, region: $REGION, instance: $HOSTNAME, proto: (http|tls)\n`

### /healthz

Useful for healthcheck infrastructure

Returns `{"state": "READY"}`

## Examples

### Docker Compose

When used in combination with [Docker Mac Net
Connect](https://github.com/chipmk/docker-mac-net-connect), Listens on
`192.168.96.19:8080` and `192.168.96.19:8443` 

```
networks:
  default:
    driver: bridge
    external: true
    name: k3d-cluster-network
services:
  helloworld:
    container_name: helloworld
    image: vincentjorgensen/node-helloworld:0.0.5
    networks:
      default:
        ipv4_address: 192.168.96.19
    ports:
    - "0.0.0.0:50375:8080/tcp"
    - "0.0.0.0:50376:8443/tcp"
    restart: unless-stopped
    environment:
      SERVICE_VERSION: d100
      ZONE: local-1
      REGION: local
      SERVER_PORT: 8080
      SERVER_SSL_PORT: 8443
      SSL_KEY: /ssl/root.key
      SSL_CERT: /ssl/root.crt
    volumes:
    - /etc/localtime:/etc/localtime:ro
    - /Volumes/Projects/k3d-calico-metallb/templates/example-ssl:/ssl:ro
```

### Kubernetes

Can be used to to see how the backend distributes traffic across the topology.
Single cluster example below.

```
---
apiVersion: v1
kind: Service
metadata:
  name: helloworld
  namespace: helloworld
  labels:
    app: helloworld
    service: helloworld
spec:
  ports:
  - name: http
    port: 8001
    targetPort: 8080 ### http # named port does not work for ambient mc mesh.internal
  selector:
    app: helloworld
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: helloworld
  namespace: helloworld
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: helloworld-us-west-1a
  namespace: helloworld
  labels:
    app: helloworld
    version: v1
spec:
  replicas: 1
  selector:
    matchLabels:
      app: helloworld
      version: us-west-1a
  template:
    metadata:
      labels:
        app: helloworld
        version: us-west-1a
    spec:
      serviceAccountName: helloworld
      affinity:
        nodeAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 1
            preference:
              matchExpressions:
              - key: topology.kubernetes.io/zone
                operator: In
                values:
                - us-west-1a
      containers:
      - name: helloworld
        env:
        - name: SERVICE_VERSION
          value: v1
        - name: ZONE
          value: us-west-1a
        - name: REGION
          value: us-west-1
        - name: SERVER_PORT
          value: '8080'
        image: vincentjorgensen/node-helloworld:0.0.5
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 8080
          name: http
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: helloworld-us-west-1b
  namespace: helloworld
  labels:
    app: helloworld
    version: v1
spec:
  replicas: 1
  selector:
    matchLabels:
      app: helloworld
      version: us-west-1b
  template:
    metadata:
      labels:
        app: helloworld
        version: us-west-1b
    spec:
      serviceAccountName: helloworld
      affinity:
        nodeAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 1
            preference:
              matchExpressions:
              - key: topology.kubernetes.io/zone
                operator: In
                values:
                - us-west-1b
      containers:
      - name: helloworld
        env:
        - name: SERVICE_VERSION
          value: v1
        - name: ZONE
          value: us-west-1b
        - name: REGION
          value: us-west-1
        - name: SERVER_PORT
          value: '8080'
        image: vincentjorgensen/node-helloworld:0.0.5
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 8080
          name: http
...
```

