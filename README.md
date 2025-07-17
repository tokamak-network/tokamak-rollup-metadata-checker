# Tokamak Rollup Metadata Checker

L2 롤업들의 메타데이터를 [Tokamak Rollup Metadata Repository](https://github.com/tokamak-network/tokamak-rollup-metadata-repository)에서 읽어와서 해당 L2 체인들의 실제 상태를 확인하는 도구입니다.

## 🚀 주요 기능

- **메타데이터 자동 수집**: GitHub에서 SystemConfig 주소 기반 메타데이터 파일들을 자동으로 가져옵니다
- **L2 상태 실시간 모니터링**: 각 L2 체인의 활성 상태, 블록 높이, 시퀀서 상태 등을 확인합니다
- **다양한 출력 형식**: JSON, Table, CSV 형식으로 결과를 출력할 수 있습니다
- **재시도 및 에러 핸들링**: 네트워크 오류에 대한 자동 재시도 기능을 제공합니다
- **컨트랙트 상태 확인**: SystemConfig, L2OutputOracle, OptimismPortal 등의 컨트랙트 상태를 확인합니다

## 📋 지원 네트워크

- **mainnet**: 이더리움 메인넷
- **sepolia**: 이더리움 세폴리아 테스트넷

## 🛠️ 설치

```bash
npm install
```

## 🔧 설정

환경 변수 파일 생성:

```bash
# .env 파일 생성
L1_RPC_URL=https://ethereum.publicnode.com
MAINNET_RPC_URL=https://ethereum.publicnode.com
SEPOLIA_RPC_URL=https://ethereum-sepolia.publicnode.com
METADATA_REPO_URL=https://raw.githubusercontent.com/tokamak-network/tokamak-rollup-metadata-repository/main
SUPPORTED_NETWORKS=mainnet,sepolia
TIMEOUT=10000
RETRY_COUNT=3
CHECK_INTERVAL=60000
OUTPUT_FORMAT=table
LOG_LEVEL=info
```

## 📖 사용법

### 기본 사용법

```bash
# 모든 네트워크의 L2 상태 확인
npm run check

# 특정 네트워크만 확인
npm run check -- --network sepolia

# 특정 SystemConfig 주소만 확인
npm run check -- --address 0x1234567890123456789012345678901234567890

# JSON 형식으로 출력
npm run check -- --format json

# CSV 형식으로 출력
npm run check -- --format csv
```

### 개발 모드

```bash
# TypeScript로 직접 실행
npm run dev

# 빌드 후 실행
npm run build
npm start
```

## 📊 출력 형식

### Table 형식 (기본값)
```
Name          | Chain ID | Status    | L2 Block | L1 Block | Sequencer | RPC | Last Checked
------------- | -------- | --------- | -------- | -------- | --------- | --- | ------------
Example L2    | 12345    | ✅ Active | 1000000  | 18500000 | ✅        | ✅  | 2024-01-01T...
```

### JSON 형식
```json
[
  {
    "chainId": 12345,
    "name": "Example L2",
    "isActive": true,
    "latestL2Block": 1000000,
    "latestL1Block": 18500000,
    "sequencerStatus": "active",
    "rpcStatus": "healthy",
    "lastChecked": "2024-01-01T12:00:00.000Z",
    "errors": []
  }
]
```

### CSV 형식
```csv
name,chainId,isActive,latestL2Block,latestL1Block,sequencerStatus,proposerStatus,rpcStatus,lastChecked,errors
Example L2,12345,true,1000000,18500000,active,active,healthy,2024-01-01T12:00:00.000Z,""
```

## 🔍 체크 항목

### L2 상태 검증
- **체인 활성화 여부**: L2 체인이 정상적으로 동작하는지 확인
- **최신 블록 높이**: L2와 L1의 최신 블록 번호
- **시퀀서 상태**: 시퀀서가 정상적으로 동작하는지 확인
- **제안자 상태**: 제안자(Proposer)가 정상적으로 동작하는지 확인
- **RPC 상태**: L2 RPC 엔드포인트가 정상적으로 응답하는지 확인
- **익스플로러 상태**: 블록 익스플로러가 정상적으로 동작하는지 확인

### 컨트랙트 상태 검증
- **SystemConfig**: 시스템 설정 컨트랙트 상태
- **L2OutputOracle**: L2 출력 오라클 상태
- **OptimismPortal**: 포털 컨트랙트 상태 (일시정지 여부 등)
- **WithdrawalDelay**: 출금 지연 상태

## 🏗️ 프로젝트 구조

```
src/
├── config/           # 환경설정
│   └── index.ts     # 앱 설정 및 상수
├── services/         # 비즈니스 로직
│   └── metadata-fetcher.ts  # 메타데이터 가져오기
├── types/           # TypeScript 타입 정의
│   └── metadata.ts  # 메타데이터 및 상태 타입
└── utils/           # 유틸리티 함수
    ├── formatters.ts    # 출력 형식 변환
    ├── logger.ts        # 로깅 유틸리티
    ├── retry.ts         # 재시도 로직
    └── validation.ts    # 데이터 검증
```

## 🧪 테스트

```bash
npm test
```

## 🤝 기여

1. 이 저장소를 포크합니다
2. 새로운 브랜치를 생성합니다 (`git checkout -b feature/new-feature`)
3. 변경사항을 커밋합니다 (`git commit -am 'Add new feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/new-feature`)
5. Pull Request를 생성합니다

## �� 라이센스

MIT License