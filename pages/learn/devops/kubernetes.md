---
title: 데브옵스 07. 컨테이너 오케스트레이션
description: 쿠버네티스의 구성 요소를 이해하고 선언한 상태대로 운영합니다.
outline: deep
---

# 07. 컨테이너 오케스트레이션

컨테이너가 수십 개가 되면 손으로 띄우고 지킬 수 없습니다. "이렇게 떠 있어야 한다"를 적어 두면 맞춰 주는 도구가 필요해집니다.

## 선언적 모델

명령이 아니라 **원하는 상태**를 적습니다.

```
명령형:  컨테이너를 3개 띄워라
선언형:  이 컨테이너가 항상 3개 떠 있어야 한다
```

하나가 죽으면 컨트롤러가 알아서 새로 띄웁니다. 노드가 사라지면 다른 노드에 다시 배치합니다. 사람이 개입하는 자리는 **원하는 상태를 바꿀 때뿐**입니다.

## 클러스터 구조

| | 하는 일 |
| --- | --- |
| API 서버 | 모든 요청의 입구, 인증과 검증 |
| etcd | 클러스터 상태 저장소 |
| 스케줄러 | 새 Pod를 어느 노드에 둘지 결정 |
| 컨트롤러 매니저 | 현재 상태를 원하는 상태로 맞춤 |
| kubelet | 각 노드에서 컨테이너를 실제로 띄움 |

관리형 서비스(EKS, GKE, AKS)를 쓰면 컨트롤 플레인은 제공자가 운영합니다. 직접 세우는 쪽은 etcd 백업까지 책임져야 하므로, **처음에는 관리형**이 거의 항상 낫습니다.

## 워크로드

| 리소스 | 쓰는 곳 |
| --- | --- |
| Pod | 컨테이너 한 묶음 (직접 만들지는 않음) |
| Deployment | 상태 없는 애플리케이션 |
| StatefulSet | 고유한 이름과 저장소가 필요한 것 (DB 등) |
| DaemonSet | 모든 노드에 하나씩 (로그 수집기, 노드 감시) |
| Job / CronJob | 한 번 실행 / 주기 실행 |

Pod는 직접 만들지 않습니다. 죽으면 그대로 사라지기 때문에, 항상 컨트롤러를 통해 만듭니다.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3
  selector:
    matchLabels: { app: api }
  template:
    metadata:
      labels: { app: api }
    spec:
      containers:
        - name: api
          image: registry.example.com/api:v1.4.0
          ports:
            - containerPort: 3000
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef: { name: api-secret, key: database-url }
          resources:
            requests: { cpu: 100m, memory: 128Mi }
            limits:   { memory: 512Mi }
          readinessProbe:
            httpGet: { path: /health/ready, port: 3000 }
            initialDelaySeconds: 5
          livenessProbe:
            httpGet: { path: /health/live, port: 3000 }
            periodSeconds: 10
```

## 자원 요청과 제한

| | 뜻 |
| --- | --- |
| `requests` | 스케줄러가 자리를 잡을 때 쓰는 기준 |
| `limits` | 이 이상 쓰면 제한 |

`requests`를 적지 않으면 스케줄러가 판단할 근거가 없어 한 노드에 몰립니다.

**CPU limit은 대체로 걸지 않습니다.** CPU는 제한에 닿으면 스로틀링이 걸려 응답이 느려지는데, 남는 CPU가 있어도 쓰지 못합니다. 메모리는 반대로 제한을 겁니다. 넘기면 OOM으로 죽지만, 그대로 두면 노드 전체를 끌고 내려갑니다.

## 프로브

| 프로브 | 실패하면 |
| --- | --- |
| `readiness` | Service에서 제외 (트래픽 안 보냄) |
| `liveness` | 컨테이너 재시작 |
| `startup` | 시작이 느린 앱에서 다른 프로브를 미룸 |

`liveness`에 DB 연결 확인을 넣으면 안 됩니다. DB가 잠깐 흔들릴 때 **모든 Pod가 동시에 재시작**되어 장애가 커집니다. liveness는 "프로세스가 응답하는가"만 봅니다.

## 네트워크

```yaml
apiVersion: v1
kind: Service
metadata:
  name: api
spec:
  selector: { app: api }
  ports:
    - port: 80
      targetPort: 3000
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt
spec:
  tls:
    - hosts: [api.example.com]
      secretName: api-tls
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: api
                port: { number: 80 }
```

Service는 Pod가 바뀌어도 변하지 않는 **안쪽 주소**입니다. Ingress는 바깥에서 들어오는 HTTP 경로를 Service로 보냅니다. Ingress 자체는 규칙일 뿐이고, 실제로 트래픽을 받는 것은 **Ingress 컨트롤러**(ingress-nginx 등)입니다. 설치하지 않으면 아무 일도 일어나지 않습니다.

## 설정과 비밀

```yaml
apiVersion: v1
kind: ConfigMap
metadata: { name: api-config }
data:
  LOG_LEVEL: info
```

Secret은 **base64 인코딩일 뿐 암호화가 아닙니다.** 클러스터에 접근할 수 있으면 그대로 읽힙니다. 저장소에 커밋하려면 Sealed Secrets나 External Secrets로 실제 값을 바깥에 두고 참조만 올립니다([보너스. 데브섹옵스](/learn/devops/devsecops)).

## kubectl

```bash
kubectl get pods -n prod
kubectl describe pod api-7d9f-x2k4 -n prod      # 이벤트까지 보임
kubectl logs -f deploy/api -n prod
kubectl logs api-7d9f-x2k4 --previous           # 죽기 직전 로그
kubectl rollout status deploy/api -n prod
kubectl rollout undo deploy/api -n prod         # 롤백
```

`describe`의 아래쪽 **Events**를 먼저 봅니다. 이미지를 못 받았는지, 자리가 없어 배치되지 않았는지가 대부분 여기 적혀 있습니다.

| 상태 | 원인 |
| --- | --- |
| `ImagePullBackOff` | 이미지 이름 오타, 레지스트리 인증 |
| `CrashLoopBackOff` | 컨테이너가 계속 죽음 — `logs --previous` |
| `Pending` | 자원 부족, 노드 셀렉터와 맞는 노드 없음 |
| `OOMKilled` | 메모리 제한 초과 |

## Helm

YAML이 환경 수만큼 복제되는 문제를 템플릿으로 풉니다.

```bash
helm upgrade --install api ./charts/api \
  -n prod -f values.prod.yaml \
  --set image.tag=v1.4.0 --wait
```

`--wait`를 붙이면 롤아웃이 끝날 때까지 기다리고, 실패하면 0이 아닌 코드로 끝납니다. CI에서 반드시 필요합니다.

## 도입 시점

쿠버네티스는 운영 비용이 큽니다. 서비스 두세 개를 돌리는 데에는 과합니다.

| 상황 | 맞는 선택 |
| --- | --- |
| 서비스 한두 개 | 컨테이너를 그냥 띄우기, PaaS |
| 트래픽이 일정하지 않음 | 서버리스, 관리형 컨테이너 서비스 |
| 서비스 여러 개, 팀 여러 개 | 쿠버네티스 |

"언젠가 필요할 것 같아서" 미리 도입하면, 정작 제품에 쓸 시간을 클러스터 운영에 씁니다.
