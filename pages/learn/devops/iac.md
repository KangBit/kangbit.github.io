---
title: 데브옵스 08. 코드형 인프라
description: 인프라와 서버 설정을 코드로 남기고, 같은 환경을 반복해서 만듭니다.
outline: deep
---

# 08. 코드형 인프라

콘솔에서 클릭해 만든 인프라는 재현할 수 없습니다. 무엇이 왜 그렇게 설정됐는지도 남지 않습니다.

## 손으로 만들 때의 문제

- 스테이징과 운영이 조금씩 다른데 어디가 다른지 모름
- 만든 사람이 떠나면 이유를 아는 사람이 없음
- 재해 복구 훈련을 할 수 없음
- 변경 이력이 없어 "어제까지 되던 것"의 시점을 못 찾음

코드로 두면 리뷰, 이력, 복제가 전부 Git에서 해결됩니다([01. Git과 버전 관리](/learn/devops/git)).

## 두 갈래

| 분류 | 다루는 것 | 도구 |
| --- | --- | --- |
| 프로비저닝 | 서버, 네트워크, DB 같은 **자원 생성** | Terraform, OpenTofu, Pulumi, CloudFormation |
| 구성 관리 | 만들어진 서버 **안의 설정** | Ansible, Chef, Puppet |

컨테이너를 쓰면 구성 관리의 비중이 크게 줄어듭니다. 서버 안을 손보는 대신 이미지를 다시 만들기 때문입니다. 그래도 네트워크와 클러스터 자체는 프로비저닝이 필요합니다.

## Terraform

```hcl
terraform {
  required_version = "~> 1.9"
  backend "s3" {
    bucket         = "example-tfstate"
    key            = "prod/network.tfstate"
    region         = "ap-northeast-2"
    dynamodb_table = "tfstate-lock"
    encrypt        = true
  }
}

resource "aws_db_instance" "main" {
  identifier        = "api-${var.env}"
  engine            = "postgres"
  engine_version    = "17"
  instance_class    = var.db_instance_class
  allocated_storage = 50

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.db.id]

  backup_retention_period = 7
  deletion_protection     = var.env == "prod"
  skip_final_snapshot     = var.env != "prod"

  tags = { Environment = var.env }
}
```

## 상태 파일

Terraform은 **무엇을 만들었는지**를 상태 파일에 적어 둡니다. 코드와 실제 자원을 잇는 유일한 연결 고리입니다.

```bash
terraform plan     # 코드와 상태를 비교해 바뀔 것을 보여 줌
terraform apply    # 적용하고 상태를 갱신
```

주의할 점이 두 가지입니다.

**상태 파일을 저장소에 올리지 않습니다.** 비밀번호와 토큰이 평문으로 들어갑니다. S3 같은 원격 백엔드에 두고 암호화합니다.

**잠금을 반드시 겁니다.** 두 사람이 동시에 `apply`하면 상태가 깨져, 실제로는 있는데 상태에는 없는 자원이 생깁니다. 위 예시의 `dynamodb_table`이 그 역할입니다.

## plan을 읽는 습관

`apply` 전에 출력을 반드시 확인합니다.

```
  ~ aws_db_instance.main
      ~ instance_class = "db.t4g.medium" -> "db.t4g.large"

-/+ aws_db_instance.main (forces replacement)
      ~ engine_version = "16" -> "17"
```

`~`는 수정이고 **`-/+`는 지우고 다시 만든다**는 뜻입니다. 데이터베이스에 이 표시가 떴는데 그냥 적용하면 데이터가 사라집니다.

```
Plan: 2 to add, 1 to change, 0 to destroy.
```

마지막 줄의 `to destroy` 숫자를 매번 확인합니다. CI에서는 `plan` 결과를 PR에 붙여 리뷰어가 보게 합니다.

## 모듈과 환경 분리

같은 구조를 환경마다 복사하면 어느 쪽이 최신인지 모르게 됩니다.

```
modules/
  network/
  database/
envs/
  staging/main.tf     ← 모듈 호출 + staging 변수
  prod/main.tf        ← 모듈 호출 + prod 변수
```

```hcl
module "database" {
  source            = "../../modules/database"
  env               = "prod"
  db_instance_class = "db.t4g.large"
}
```

차이가 **변수 파일에만** 남습니다. 스테이징에서 검증한 변경이 운영에도 같은 모양으로 들어갑니다.

## 콘솔에서 고치면 생기는 일

급해서 콘솔에서 보안 그룹을 열었다고 합시다. 다음 `apply`에서 Terraform이 그것을 **되돌립니다.** 코드가 기준이기 때문입니다.

이런 어긋남을 드리프트라고 합니다. 줄이는 방법은 두 가지입니다.

- 콘솔 권한을 읽기 전용으로 두고 변경은 코드로만
- `terraform plan`을 주기적으로 돌려 차이가 생기면 알림

긴급 상황에 콘솔로 고쳤다면, 끝난 뒤 **반드시 코드에 반영**합니다.

## Ansible

서버 안의 설정을 맞춥니다. 에이전트를 깔지 않고 SSH로 붙는 점이 Chef·Puppet과 다릅니다.

```yaml
- hosts: web
  become: true
  tasks:
    - name: Nginx 설치
      apt:
        name: nginx
        state: present
        update_cache: true

    - name: 설정 파일 배포
      template:
        src: nginx.conf.j2
        dest: /etc/nginx/conf.d/app.conf
        mode: "0644"
      notify: reload nginx

  handlers:
    - name: reload nginx
      systemd:
        name: nginx
        state: reloaded
```

핵심은 **멱등성**입니다. 몇 번을 실행해도 결과가 같아야 합니다. `state: present`는 이미 설치돼 있으면 아무 일도 하지 않습니다. `shell` 모듈로 명령을 직접 부르면 이 성질이 깨지므로, 전용 모듈이 있으면 그쪽을 씁니다.

`notify`와 `handlers`도 같은 맥락입니다. 설정이 **실제로 바뀐 경우에만** 재시작합니다.

## 비밀 값 다루기

코드에 평문으로 적지 않습니다.

```yaml
# ansible-vault로 암호화한 파일을 참조
vars_files:
  - secrets.yml      # ansible-vault encrypt secrets.yml
```

Terraform에서는 변수로 주입하거나 Vault·클라우드 시크릿 서비스에서 읽습니다. 다만 **상태 파일에는 평문으로 남는다**는 점을 기억해 둡니다. 상태 파일 자체의 접근 권한을 좁히는 것이 현실적인 대응입니다.
