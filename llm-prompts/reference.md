# Tokamak Rollup Metadata Reference

## 메타데이터 경로 템플릿

- **디렉토리(목록) 접근용:**
  - `https://github.com/tokamak-network/tokamak-rollup-metadata-repository/tree/main/data/{network}`
- ** 메타데이타 접근용:**
  - `https://github.com/tokamak-network/tokamak-rollup-metadata-repository/blob/main/data/{network}/{systemConfigAddress}.json`
- `{network}`: "mainnet" 또는 "sepolia"
- `{systemConfigAddress}`: 소문자 0x-prefixed 이더리움 주소


## 데이터 패칭/크롤링 방식 안내
- **GitHub 공식 API(REST, GraphQL)는 rate limit(사용량 제한)이 엄격하므로, 대량/빈번한 요청에는 적합하지 않음**
- **가능하면 raw 파일 URL 또는 HTML 크롤링 방식으로 메타데이터를 읽어오는 것이 더 적합함**
- 크롤링 유틸 함수 예시는 `./utils/git-crawling.ts` 참고

## 참고
- 메타데이터 스펙 및 필드 구조는 `tokamak-rollup-metadata-spec.md` 참고

