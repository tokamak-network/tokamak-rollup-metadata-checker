
# Tokamak Rollup Metadata Checker 프론트엔드 기술 스펙 가이드

## 0. 구현 범위

- **현재는 메타데이터 요약 탭(기능)만 실제로 구현합니다. 나머지 탭은 UI만 제공하고, 기능 구현은 생략합니다.**
- **메타데이터 요약 탭은 스마트컨트랙트 연동 없이, 메타데이터(JSON 등)를 읽어서 바로 화면에 보여주면 됩니다.**
- **메타데이터는 반드시 reference.md의 안내에 따라 크롤링(HTML 파싱 등) 방식으로 가져와야 합니다.**
- **메타데이터를 읽을 때는 반드시 reference.md의 데이터 소스/경로/파일명 규칙/예시를 참고해야 합니다.**
- **입력받은 값(네트워크, 시스템컨피그 주소)과 조회한 메타데이터 내용은 탭이 이동되더라도 계속 유지되어야 합니다.**
- **조회 버튼을 누를 때마다 메타데이터가 새로 갱신(재조회)되어야 합니다.**
- **데이터 패칭은 @tanstack/react-query의 useQuery 등으로 비동기 데이터 패칭만 구현하면 충분합니다.**
- **데이터가 없거나 조회에 실패하면 "메타데이터를 불러올 수 없습니다"라는 메시지를 보여줍니다.**
- **각 탭의 기능 동작이 없어도, 탭을 누르면 해당 탭 아래에 디자인(화면 구조, 레이아웃, 안내문 등)은 반드시 보여야 합니다.**
- **메타데이터 요약 탭에서는 다음 정보를 우선적으로 상단에 요약 카드/테이블로 표시해야 합니다:**
    - name, description, website, logo
    - rollupType, stack 정보
    - l1ChainId, l2ChainId, rpcUrl, wsUrl
    - nativeToken 정보
    - status, sequencer.address, lastUpdated
- **컨트랙트 주소(l1Contracts, l2Contracts), networkConfig, explorers, bridges, staking 등은 하위 섹션 또는 확장 정보로 구분해 표시합니다.**

## 1. 프로젝트 및 코드 작성 규칙

- **Next.js 14 App Router**를 사용합니다. (pages 디렉토리 대신 app 디렉토리 사용)
- **TypeScript**로 작성합니다.
- **함수형 컴포넌트**와 **React Hooks**만 사용합니다.
- **상태 관리**는 컴포넌트 로컬 상태와 @tanstack/react-query를 사용합니다.  (Redux, Zustand 등은 사용하지 않습니다.)
- **지갑 연결 및 네트워크 정보**는 wagmi v2를 사용합니다.
- **스마트컨트랙트 read/write**는 viem을 사용합니다.
- **API 호출, 비동기 데이터**는 @tanstack/react-query의 useQuery, useMutation을 사용합니다.
- **UI 프레임워크**는 사용하지 않으며, 기본 HTML/CSS 또는 Tailwind CSS만 허용합니다.  (Material UI, Antd 등은 사용하지 않습니다.)
- **컴포넌트/훅/유틸**은 반드시 분리하여 작성합니다.

## 2. 네트워크 및 입력

- 네트워크는 "메인넷"과 "세폴리아"만 지원합니다.
- 네트워크 선택은 드롭다운으로 구현합니다.
- 시스템 컨피그 주소는 텍스트 입력 필드로 받습니다.
- **조회 버튼을 누르면 항상 "메타데이터 요약" 탭이 자동으로 선택되고, 해당 탭에 입력값에 대한 메타데이터 요약 결과가 바로 표시되어야 합니다.**
- 다른 탭에 있다가 다시 조회 버튼을 누르면, 다시 "메타데이터 요약" 탭으로 이동하여 결과를 보여줍니다.

## 3. 데이터 패칭 및 컨트랙트 연동

- 데이터 패칭은 react-query의 useQuery를 사용합니다.
- 스마트컨트랙트 연동은 viem을 사용합니다.
- 지갑 연결 및 네트워크 정보는 wagmi v2의 useAccount, useNetwork, useSwitchNetwork 등 사용.

## 4. 탭 UI

- 5개의 탭(롤업 메타데이터 요약, 컨트랙트 주소 정보, 롤업 상태/파라미터, 이벤트 로그, 토큰 정보)을 TabNavigation 컴포넌트로 구현합니다.
- 각 탭은 별도의 페이지(/app/[tab]/page.tsx)로 분리합니다.

## 5. 에러/로딩 처리

- 데이터 로딩 중에는 스피너 또는 "로딩 중" 메시지를 표시합니다.
- 에러 발생 시 사용자에게 명확한 에러 메시지를 보여줍니다.

---

## 중요
- wagmi v2 최신 문법 사용
- QueryClientProvider, WagmiProvider 설정 필수 (클라이언트 컴포넌트 분리)
- useReadContract에 chainId 명시적 지정
- currentAgendaStatus 반환값이 배열일 수 있으니 파싱에 유의
- 모든 네트워크별 주소/ABI/enum 매핑 정확히 반영

## 추가
- 코드 전체를 하나의 실행 가능한 Next.js 14 App Router 프로젝트로 작성
