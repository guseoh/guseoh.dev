# GitHub Activity 갱신 방식 보고서

## 1. 결론

홈 화면의 GitHub Activity 잔디는 실시간 클라이언트 호출이 아니라 빌드 전에 생성한 정적 JSON을 사용합니다.

- 로컬에서는 `npm run github:contributions`를 직접 실행해야 갱신됩니다.
- 배포에서는 `main` 브랜치 push 시 빌드 직전에 갱신을 시도합니다.
- 별도 `Update GitHub Activity` workflow가 매일 15:10 UTC, 즉 다음 날 00:10 KST에 JSON을 갱신합니다.
- 같은 데이터면 파일을 다시 쓰지 않으며, 실제 변경이 있을 때만 자동 커밋과 push가 실행됩니다.
- JSON이 변경되면 schedule workflow가 기존 `deploy.yml`을 명시적으로 dispatch해 정적 사이트도 다시 배포합니다.

## 2. 데이터 흐름

1. `.github/workflows/deploy.yml`의 `Fetch GitHub contributions` 단계가 `npm run github:contributions`를 실행합니다.
2. `package.json`의 `github:contributions` 스크립트가 `scripts/fetch-github-contributions.mjs`를 실행합니다.
3. 스크립트는 `GH_CONTRIBUTIONS_TOKEN`이 있으면 GitHub GraphQL API를 먼저 사용합니다.
4. 토큰이 없거나 GraphQL 요청이 실패하면 GitHub 공개 contribution HTML을 fallback으로 파싱합니다.
5. 결과는 `public/data/github-contributions.json`에 저장됩니다.
6. `src/components/home/GitHubGrass.astro`가 이 JSON을 import합니다.
7. `src/utils/githubStats.ts`가 최근 1년 주간 배열, 올해 contribution 수, 연속 contribution 정보를 계산합니다.
8. Astro 빌드 결과에 정적 HTML/CSS/JSON 기반 잔디가 포함됩니다.
9. `.github/workflows/update-github-activity.yml`은 매일 갱신 결과에 실제 차이가 있을 때만 JSON을 커밋합니다.
10. 자동 커밋 후 `deploy.yml`을 `workflow_dispatch`로 실행해 최신 JSON을 사이트에 반영합니다.

## 3. 관련 파일

- `.github/workflows/deploy.yml`: 배포 중 contribution 데이터를 갱신하는 자동 실행 지점입니다.
- `.github/workflows/update-github-activity.yml`: 매일 00:10 KST 자동 갱신 및 수동 실행 지점입니다.
- `package.json`: `github:contributions` 명령을 정의합니다.
- `scripts/fetch-github-contributions.mjs`: GraphQL, 공개 HTML fallback, 빈 데이터 fallback을 처리합니다.
- `public/data/github-contributions.json`: 빌드에서 사용하는 생성 데이터입니다.
- `src/components/home/GitHubGrass.astro`: 홈 화면 GitHub Activity UI를 렌더링합니다.
- `src/utils/githubStats.ts`: 잔디 표시용 통계와 날짜 배열을 계산합니다.
- `README.md`: fallback 정책과 배포 체크리스트를 요약합니다.

## 4. 자동 갱신 범위

- `main`에 push하면 GitHub Pages 배포 workflow가 실행되고, 빌드 전에 contribution JSON 갱신을 시도합니다.
- 매일 15:10 UTC에 schedule workflow가 실행됩니다. 한국 시간으로는 다음 날 00:10입니다.
- Actions 탭에서 `Update GitHub Activity`를 선택해 `workflow_dispatch`로 수동 갱신할 수 있습니다.
- schedule workflow가 JSON을 커밋한 뒤 기존 Pages 배포 workflow인 `deploy.yml`을 명시적으로 dispatch합니다.
- GitHub Actions bot의 일반 push는 다른 workflow를 자동 실행하지 않으므로 이 명시적 dispatch 단계가 필요합니다.
- 로컬 개발 서버는 자동으로 contribution 데이터를 새로 가져오지 않습니다. 최신 데이터가 필요하면 `npm run github:contributions`를 먼저 실행합니다.

## 5. Fallback 정책

- `GH_CONTRIBUTIONS_TOKEN`이 있으면 GraphQL API를 우선 사용합니다.
- secret이 없으면 빈 문자열로 전달되며 공개 contribution HTML을 바로 사용합니다.
- GraphQL 실패 시 공개 contribution HTML을 파싱합니다.
- GraphQL과 공개 HTML이 모두 실패하고 기존 JSON이 있으면 기존 데이터를 유지합니다.
- 기존 JSON도 없으면 contribution 수가 모두 0인 빈 데이터를 생성해 빌드 실패를 막습니다.
- UI는 데이터 출처가 `empty`일 때 fallback 안내 문구를 표시합니다.

## 6. 한계

- 배포 또는 명령 실행 시점의 데이터이므로 GitHub 프로필처럼 완전한 실시간 표시는 아닙니다.
- 공개 HTML fallback은 GitHub 마크업 변경의 영향을 받을 수 있습니다.
- 토큰이 없으면 비공개 contribution이 공개 프로필 설정에 따라 누락될 수 있습니다.
- 데이터 갱신 실패 시 사이트는 안정적으로 빌드되지만, 잔디가 오래된 데이터로 보일 수 있습니다.

## 7. 변경 감지

- `generatedAt`만 달라지고 contribution 데이터가 같으면 파일을 다시 쓰지 않습니다.
- workflow는 `git diff --cached --quiet`으로 실제 변경 여부를 확인합니다.
- 변경이 없으면 `No GitHub Activity changes.`를 출력하고 커밋 없이 종료합니다.

## 8. 추후 개선안

- fallback이 반복될 때 GitHub Actions summary나 Slack 알림으로 확인 가능하게 합니다.
- JSON 생성 결과를 PR diff로 확인할 수 있는 별도 maintenance workflow를 둡니다.
