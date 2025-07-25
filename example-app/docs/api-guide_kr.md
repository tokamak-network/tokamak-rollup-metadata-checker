# 📡 Tokamak Rollup Metadata Checker API 사용 가이드 (한글)

> 이 문서는 ChatGPT, LLM, 자동화 스크립트 등에서 API를 참조하거나 연동할 때
> **정확한 파라미터, 예시, 응답 포맷, 활용 시나리오**를 빠르게 파악할 수 있도록 작성되었습니다.

---

## 1. `/api/contract-call`

### 목적
- **임의의 이더리움 컨트랙트 함수**를 호출하고, 그 결과를 반환합니다.
- L1/L2 컨트랙트의 상태(예: unsafeBlockSigner, memo, operator 등) 조회에 사용

### 요청 방식
- `GET` 또는 `POST`

### 파라미터
| 이름         | 타입     | 필수 | 설명                                 |
|--------------|----------|------|--------------------------------------|
| address      | string   | 예   | 컨트랙트 주소                        |
| chainId      | number   | 예   | 체인 ID (예: 1=mainnet, 11155111=sepolia) |
| function     | string   | 예   | **함수 시그니처**(예: foo(uint256)) 또는 함수명<br>※ 오버로딩 함수가 있을 경우 반드시 시그니처 사용 |
| contractType | string   | 예   | ABI 매핑용 타입명 (예: system-config) |
| args         | array    | 아니오| 함수 인자 (필요시)                   |

### 함수 시그니처 사용 권장
- 이더리움 컨트랙트에는 **오버로딩 함수**(이름은 같고 파라미터 타입이 다른 함수)가 있을 수 있습니다.
- 이 경우, `function` 파라미터에 **함수명만 넘기면 잘못된 함수가 호출될 수 있으므로**<br>**반드시 시그니처(예: foo(uint256), bar(address,uint256))를 사용**해야 합니다.
- 함수명만 넘기는 방식은 오버로딩이 없는 경우에만 하위 호환용으로 지원됩니다.

### 요청 예시
#### GET (시그니처 사용)
```
/api/contract-call?address=0x1234...&chainId=1&function=foo(uint256)&contractType=example&args=[123]
```
#### POST (시그니처 사용)
```json
{
  "address": "0x1234...",
  "chainId": 1,
  "function": "foo(uint256)",
  "contractType": "example",
  "args": [123]
}
```

#### 오버로딩 함수 예시
```solidity
function foo(uint256 a) public view returns (uint256);
function foo(address a) public view returns (address);
```
- 위와 같이 오버로딩된 함수가 있을 때는 반드시 `function=foo(uint256)` 또는 `function=foo(address)`처럼 시그니처로 구분해야 합니다.

### 응답 예시
```json
{
  "result": "0xabc123... (함수 반환값)",
  "error": null
}
```

---

## 2. `/api/l1-contract-verification`

### 목적
- L1 컨트랙트(프록시/구현체 포함)가 **Tokamak 공식 배포 바이트코드와 일치하는지 검증**합니다.
- 프록시 타입 인식, 구현체/어드민 주소 추출, 바이트코드 비교 등 자동 처리

### 요청 방식
- `POST`

### 요청 바디
```json
{
  "name": "SystemConfig",
  "address": "0x...",
  "network": "sepolia"
}
```

### 응답 예시
```json
{
  "contractName": "SystemConfig",
  "address": "0x...",
  "isProxy": true,
  "proxyMatch": true,
  "implementationAddress": "0x...",
  "implementationMatch": true,
  "officialProxyBytecode": "0x...",
  "officialImplBytecode": "0x...",
  "inputProxyBytecode": "0x...",
  "implementationBytecode": "0x...",
  "adminAddress": "0x..."
}
```

---

## 3. `/api/l2-list`

### 목적
- 등록된 모든 L2 롤업의 기본 정보(이름, 주소, 체인ID 등) 목록을 반환합니다.
- 프론트엔드에서 L2 선택 리스트, 대시보드 등에서 사용

### 요청 방식
- `GET`

### 응답 예시
```json
[
  {
    "name": "Tokamak L2",
    "systemConfigAddress": "0x...",
    "l1ChainId": 1,
    "l2ChainId": 5050,
    "rollupType": "optimistic",
    "status": "active"
  },
  ...
]
```

---

## 4. `/api/rollups/[address]`

### 목적
- 특정 L2의 상세 메타데이터 및 상태 정보를 반환합니다.
- 프론트엔드 상세화면, 상태 체크 등에 사용

### 요청 방식
- `GET`

### 파라미터
| 이름    | 타입   | 필수 | 설명                  |
|---------|--------|------|-----------------------|
| address | string | 예   | SystemConfig 주소 (path param) |

### 응답 예시
```json
{
  "metadata": {
    "name": "Tokamak L2",
    "description": "...",
    "logo": "...",
    "l1ChainId": 1,
    "l2ChainId": 5050,
    ...
  },
  "status": {
    "latestL2Block": 123456,
    "latestL1Block": 23456789,
    "sequencerStatus": "active",
    ...
  }
}
```

---

## 네트워크 식별자 (l1ChainId)

| 네트워크   | l1ChainId |
|------------|-----------|
| mainnet    | 1         |
| sepolia    | 11155111  |

---

## 활용 팁 (LLM/ChatGPT 등에서)
- **파라미터와 응답 필드명을 정확히 사용**하면 LLM이 자동화 스크립트/코드 생성에 활용하기 쉽습니다.
- **예시 요청/응답**을 복사해 프롬프트에 붙여넣으면, LLM이 API 연동 코드를 쉽게 생성할 수 있습니다.
- **에러 케이스**(예: 잘못된 주소, ABI 미등록 등)도 명확히 응답하므로, LLM이 예외처리 로직을 자동으로 제안할 수 있습니다.

### ChatGPT/LLM 프롬프트 예시

```
토카막 롤업에서 sepolia 네트워크(l1ChainId=11155111)에 등록된 롤업 이름만 알려줘.
아래 API를 사용해서 결과를 가져와줘:

GET /api/l2-list

그리고 응답에서 l1ChainId가 11155111인 롤업의 name만 리스트로 뽑아줘.
```

### 파이썬 코드 예시 (코드 인터프리터/플러그인용)

```python
import requests

response = requests.get('https://YOUR_DOMAIN/api/l2-list')
rollups = response.json()
sepolia_rollups = [r['name'] for r in rollups if r['l1ChainId'] == 11155111]
print(sepolia_rollups)
```

---

## 기타
- 모든 API는 RESTful JSON 기반이며, 인증/권한이 필요 없는 공개 엔드포인트입니다.
- 추가적인 엔드포인트가 생기면 이 문서에 계속 업데이트하세요.