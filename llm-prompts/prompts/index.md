# Tokamak Rollup Metadata Checker 앱 개발 워크플로우 안내

- Tokamak Rollup Metadata Checker 앱을 개발할 때는 **하나씩 파일을 생성하는 방식이 아니라, 반드시 아래와 같이 npx create-next-app ... 명령어로 완전 자동화된 프로젝트 전체 생성만을 사용해야 합니다.**
- 명령어:
  npx create-next-app@latest next-app --ts --no-tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-experimental-app-router

---

아래 지침을 참고하여 Tokamak Rollup Metadata Checker 앱을 Next.js 14(App Router) 기반으로 실행 가능한 형태로 만들어주세요.

## Tailwind CSS 설치 및 초기화 주의사항

- tailwindcss, postcss, autoprefixer 등은 반드시 Next.js 프로젝트 디렉토리(예: next-app/)에서 설치하세요:
  cd next-app
  npm install tailwindcss postcss autoprefixer --save-dev

- **상위(루트) 디렉토리에서 설치하면, next-app/node_modules에 실행 파일이 생성되지 않아 tailwindcss 명령이 동작하지 않습니다.**

- tailwindcss 설치/초기화, 실행 관련 모든 명령은 반드시 next-app/ 디렉토리에서 실행하세요.

- 설치가 완료된 후에만 아래 명령을 실행하세요:
  npx tailwindcss init -p

- tailwindcss가 설치되지 않은 상태에서 npx tailwindcss init -p를 실행하면
  "could not determine executable to run" 에러가 발생할 수 있습니다.

- 문제가 반복될 경우 node_modules, package-lock.json을 삭제하고 npm install을 다시 실행하세요.

## 1. 프로젝트 생성 및 환경설정

- npx create-next-app@latest --ts 명령어로 새 Next.js 14 TypeScript 프로젝트를 생성하세요.
- 반드시 프로젝트 루트(next-app 폴더)에 package.json, tsconfig.json, next.config.js 등 필수 설정 파일이 포함되어야 합니다.
- Tailwind CSS, wagmi v2, viem, @tanstack/react-query를 설치하고, Tailwind CSS를 공식 문서대로 설정하세요.
- **wagmi v2는 @tanstack/react-query 5.x 이상, viem 2.x 이상 버전과만 호환됩니다. package.json에 @tanstack/react-query 5.x 이상, viem 2.x 이상을 명시하세요.**
- app 디렉토리 하위에 아래 컴포넌트와 페이지를 생성하세요.

## 2. 파일 구조 및 구현

- app/page.tsx : 메인 페이지 (탭 UI, 네트워크 선택, 시스템 컨피그 입력, 각 탭별 placeholder)
- app/TabNavigation.tsx : 탭 네비게이션 컴포넌트
- app/NetworkSelector.tsx : 네트워크 선택 드롭다운
- app/SystemConfigInput.tsx : 시스템 컨피그 주소 입력
- (필요시 각 탭별 상세 컴포넌트 추가)

## 3. 기술/UX 요구사항

- 상세 기술 스펙과 UI/UX 지침은 frontend.md와 각 기능별 md 파일(basic-info.md, operational-status.md, trust-status.md, contract-verification.md, sequencer-dao-info.md)을 참고하세요.
- TypeScript, 함수형 컴포넌트, React Hooks만 사용
- 상태 관리는 @tanstack/react-query와 로컬 상태만 사용
- UI 프레임워크는 Tailwind CSS만 허용

## 4. 실행 방법

1. 의존성 설치:
   npm install

2. 개발 서버 실행:
   npm run dev

3. 브라우저에서 http://localhost:3000 접속

---

## 참고 파일

- 화면 UI 지침: frontend.md
- 기술 요구사항: 각 기능별 md 파일
- 참고 자료: ../reference.md, ../tokamak-rollup-metadata-spec.md
