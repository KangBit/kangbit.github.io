---
title: 소개
# titleTemplate:
# description:
# outline: deep
prev: false
next: false
---

<!--
https://www.buildyourstory.kr/writing-selfintroduction-letter5/

1.내가 누구인지, 지금 어떤 상태인지 보여준다.
→ 나의 과거와 현재를 보여주는 메시지를 구성한다.

2.갈망하는 목표와 이루려는 이유가 무엇인지 알려준다.
→ 나의 목표와 그것을 이루려는 이유가 무엇인지 알려준다.

3.극복해야 할 장애물이 눈 앞에 있지만, 이뤄낼 수 있을 거라는 믿음을 준다.
→ 내가 앞으로 다가올 문제도 잘 해결해줄 수 있는 존재라는 걸 보여준다.
-->

<script setup>
import dayjs from 'dayjs';

const firstJobFrom = [dayjs('2019-06-26'), dayjs('2022-03-26')];
const secondJobFrom = [dayjs('2022-08-16'), dayjs()];

const firstJobDays = firstJobFrom[1].diff(firstJobFrom[0], 'days');
const secondJobDays = secondJobFrom[1].diff(secondJobFrom[0], 'days');
const totalJobDays = firstJobDays + secondJobDays;

const firstJob = {
  month: Math.floor(firstJobDays / 30),
  day: firstJobDays % 30,
}
const secondJob = {
  month: Math.floor(secondJobDays / 30),
  day: secondJobDays % 30,
}
const totalJob = {
  year: Math.floor(totalJobDays / 365),
  month: Math.floor(totalJobDays % 365 / 30),
  day: totalJobDays % 30,
}

console.log(`총 경력 : ${totalJob.year}년 ${totalJob.month}개월 ${totalJob.day}일`);
console.log(`2019-06-26 ~ 2022-03-26 : ${firstJob.month}개월 ${firstJob.day}일`);
console.log(`2022-08-16 ~ ${dayjs().format('YYYY-MM-DD')} : ${secondJob.month}개월 ${secondJob.day}일`);

console.log(`========================================`);
console.log(`군 복무 : 2012-04-10 ~ 2014-01-09`);


console.log(`========================================`);
console.log(`정보처리기사 자격증 취득 : 2016-07-15 (한국산업인력공단)`);

console.log(`========================================`);
console.log(`대학 재학 : 2011-02 ~ 2017-07`);
console.log(`고등학교 재학 : 2008-03 ~ 2011-02`);
</script>

## 소개

컴퓨터공학 전공으로 학사 학위를 취득했으며, 6년의 경력을 보유하고 있습니다.

프론트엔드 개발과 네이티브 앱 개발, 백엔드 개발 경험이 있습니다.

지금은 프론트엔드 개발에 집중하고 있습니다.

## 경력

초기에는 풀스택 개발자로서 프론트엔드 개발과 앱 개발, 백엔드 개발을 병행했습니다.

센서 데이터를 수집하고 시각화하는 모니터링 시스템과

전세계 팬덤 네트워크를 위한 소셜 네트워킹 플랫폼을 개발했습니다.

네이티브 앱과 웹뷰 웹페이지를 함께 개발하며,

하이브리드 앱에서 발생할 수 있는 다양한 문제들을 해결했습니다.

이 시기에 개발 전반에 걸친 넓은 시야와 문제 해결 능력을 길렀습니다.

<br>

프론트엔드 개발에 집중하게 된 후에도 개발 프로세스 전반에 대한 이해도를 바탕으로

동료 개발자, 기획자, 디자이너와 소통하고 도움을 주기 위해 노력했습니다.

기획, 설계 단계부터 적극적으로 의견을 개진하였으며,

동료 개발자들 사이에서 의견을 조율하기도 했습니다.

또한 다양한 차트 라이브러리와 샌드버드 솔루션 이용 경험을 바탕으로 팀에 기여했습니다.

이러한 노력을 통해 팀 내 프론트엔드 업무를 매니징하는 역할을 맡기도 했습니다.

## 사람에게서 배우는 것을 좋아합니다

공자는 세 사람 중에 한 명의 스승이 있다고 했지만, 나아가 세 사람 모두가 스승이라고 생각합니다.

좋은 모습에서만 보고 배울 수 있는 것이 아니라 나쁜 모습도 반면교사 삼아 배울 수 있기 때문입니다.

이렇게 '배울 점 없는 사람은 없다' 라는 마음으로 끊임없이 배우려고 노력했고,

사람을 통해 배우는 것을 좋아하게 되었습니다.

<!-- ## 무제

주어진 자원에 맞는 기술, 해결책을 적절히 선택하는 것.

필요할 때에는 복잡하고 어려운 코드를 작성할 수 있지만

그렇지 않을 때는 단순하고 쉬운 코드를 선택하는 것을 중요하게 생각하게 되었습니다.

적절한 선택을 하기 위한 안목을 키우기 위해 계속해서 배우고자 합니다.

이렇게 쌓은 지식과 경험을 나누고, 동료들과 함께 성장하며 시너지를 내기 위해 노력하고자 합니다. -->
