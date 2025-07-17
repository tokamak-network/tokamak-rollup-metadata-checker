import dotenv from 'dotenv';

dotenv.config();

export interface AppConfig {
  timeout: number;
  retryCount: number;
  metadataRepoUrl: string;
  jsDelivrApiUrl: string;
  supportedNetworks: string[];
  checkInterval: number;
  outputFormat: 'json' | 'table' | 'csv';
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export const config: AppConfig = {
  timeout: parseInt(process.env.TIMEOUT || '10000'),
  retryCount: parseInt(process.env.RETRY_COUNT || '3'),
  // GitHub 저장소에서 메타데이터 파일을 직접 다운로드하는 URL
  metadataRepoUrl: process.env.METADATA_REPO_URL || 'https://cdn.jsdelivr.net/gh/tokamak-network/tokamak-rollup-metadata-repository@main',
  // jsDelivr API를 통해 파일 목록을 가져오는 URL (JSDELIVR_API_URL 환경변수로 설정 가능)
  jsDelivrApiUrl: process.env.JSDELIVR_API_URL || 'https://data.jsdelivr.com/v1/package/gh/tokamak-network/tokamak-rollup-metadata-repository@main/flat',
  supportedNetworks: (process.env.SUPPORTED_NETWORKS || 'mainnet,sepolia').split(','),
  checkInterval: parseInt(process.env.CHECK_INTERVAL || '60000'), // 1분
  outputFormat: (process.env.OUTPUT_FORMAT as 'json' | 'table' | 'csv') || 'table',
  logLevel: (process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info'
};

// L1 컨트랙트 호출이 필요한 경우 아래 설정들을 다시 추가
// export const RPC_ENDPOINTS = { ... }
// export const CHAIN_IDS = { ... }
// export const CONTRACT_ABIS = { ... }