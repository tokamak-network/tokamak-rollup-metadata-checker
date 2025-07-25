# Tokamak Rollup Metadata Checker (KR)

## 개요

이 프로젝트는 [Tokamak Rollup Metadata Repository](https://github.com/tokamak-network/tokamak-rollup-metadata-repository/tree/main/data)에 등록된 L2 롤업 정보가 정상적인지 확인하는 툴입니다. 사용자가 확인하기 원하는 롤업의 L1/L2의 정보를 확인할 뿐만아니라, 나아가 L1/L2 컨트랙이 공식 배포버전과 동일한지 검증하는 기능도 수행합니다.

화면에서는 아래와 같은 L2 메타데이터와 상태 정보를 한눈에 확인할 수 있습니다:
- L2 이름, 설명, 로고, 네트워크, 체인ID
- L2/L1 블록 높이, 블록타임, 가스리밋, 마지막 프로포절/배치 시각
- RPC, 블록 익스플로러, 브릿지, 스테이킹 등 서비스별 상태
- L1/L2 주요 컨트랙트 주소(복사/익스플로러 링크)
- 스테이킹 후보자/오퍼레이터/매니저 정보, 메모, 등록 트랜잭션 등
- 컨트랙트 검증(공식 배포 바이트코드와 일치 여부)

## ✨ 주요 기능

- **L2 메타데이터 및 상태 체크**: 메인화면에서 L2를 선택하면, 해당 L2의 메타데이터와 실제 상태(블록, 시퀀서, 컨트랙트 등)를 실시간으로 확인
  - 예시: L2 이름, 설명, 네트워크, 체인ID, 블록 높이, 블록타임, 가스리밋, 프로포절/배치 시각, 서비스(RPC/익스플로러/브릿지/스테이킹) 상태, 컨트랙트 주소, 스테이킹 정보 등
- **L1/L2 컨트랙트 공식 배포 버전 검증**: L2에 연결된 L1/L2 컨트랙트(프록시/구현체 포함)가 Tokamak 공식 배포 바이트코드와 일치하는지 검증
- **프록시 타입 인식**: 프록시별 슬롯/구조에 맞게 구현체/어드민 주소 추출 및 바이트코드 비교
- **API 엔드포인트**: Next.js 기반 L1 컨트랙트 검증 API 제공
- **UI 컴포넌트**: 검증 결과를 보여주는 React 컴포넌트
- **테스트**: 성공/실패 케이스를 모두 포함한 Jest 테스트
- **RPC 레이트 리밋 대응**: RPC 호출 간 딜레이 적용

## 📁 프로젝트 구조

```
public/
  bytecodes/                # 공식 프록시 바이트코드 JSON (Proxy.json, L1ChugSplashProxy.json 등)
src/
  app/
    api/
      l1-contract-verification/route.ts  # L1 컨트랙트 검증 API
  components/
    ui/ContractVerificationCard.tsx      # 검증 결과 UI
  utils/
    abi.ts                # 검증 로직
    abi.test.ts           # Jest 테스트
    official-deployment.ts# 공식 바이트코드 fetch
```

## ⚡ 사용법

### 1. 의존성 설치
```bash
npm install
```

### 2. 공식 바이트코드 파일 준비
- `public/bytecodes/` 폴더에 공식 프록시 바이트코드 JSON(예: Proxy.json, L1ChugSplashProxy.json 등)을 넣으세요.
- 각 파일에는 최소한 `bytecode` 필드가 포함되어야 합니다.

### 3. 테스트 실행
```bash
npm test
```

### 4. Next.js 앱 실행
```bash
npm run dev
```

### 5. API 사용 예시
- `/api/l1-contract-verification` 엔드포인트에 POST로 컨트랙트 정보를 보내면, 배포 바이트코드와 공식 바이트코드를 비교해줍니다.

#### 예시 요청
```json
{
  "name": "SystemConfig",
  "address": "0x...",
  "network": "sepolia"
}
```

## 📝 참고
- L1 컨트랙트 검증만 지원합니다 (L2 모니터링/CLI 기능 없음)
- 프록시/구현체 바이트코드 비교는 프록시 타입별로 동작합니다
- 프록시 타입별 공식 바이트코드는 반드시 `public/bytecodes/`에 위치해야 합니다
- 영문 설명은 `README.md`를 참고하세요

## 라이선스
MIT