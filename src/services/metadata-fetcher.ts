import { RollupMetadata } from '../types/metadata';

export class MetadataFetcher {
  private readonly repoUrl: string;
  private readonly jsDelivrApiUrl: string;
  private readonly timeout: number;

  constructor(repoUrl: string, jsDelivrApiUrl: string, timeout: number = 10000) {
    this.repoUrl = repoUrl;
    this.jsDelivrApiUrl = jsDelivrApiUrl;
    this.timeout = timeout;
  }

    async fetchMetadata(network: string, systemConfigAddress: string): Promise<RollupMetadata> {
    const url = `${this.repoUrl}/data/${network}/${systemConfigAddress.toLowerCase()}.json`;

    try {
      console.log(`🌐 Fetching from GitHub: ${url}`);
      const response = await fetch(url, {
        signal: AbortSignal.timeout(this.timeout)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json() as RollupMetadata;
    } catch (error) {
      throw new Error(`Failed to fetch metadata for ${systemConfigAddress} on ${network}: ${error}`);
    }
  }

    async fetchAllMetadata(network: string): Promise<RollupMetadata[]> {
    // jsDelivr API로 디렉토리 목록 가져오기 (rate limit 없음!)
    const l2Addresses = await this.getL2AddressesFromJsDelivr(network);

    console.log(`📋 Found ${l2Addresses.length} L2s in ${network}:`, l2Addresses);

    if (l2Addresses.length === 0) {
      console.warn(`⚠️ No L2s found for network: ${network}`);
      return [];
    }

    // 각 주소에 대해 메타데이터 가져오기
    const metadataPromises = l2Addresses.map(async (address) => {
      try {
        return await this.fetchMetadata(network, address);
      } catch (error) {
        console.warn(`⚠️ Failed to fetch ${address} on ${network}:`, error);
        return null;
      }
    });

    const results = await Promise.all(metadataPromises);
    const validResults = results.filter((result): result is RollupMetadata => result !== null);

    console.log(`✅ Successfully loaded ${validResults.length}/${l2Addresses.length} L2s for ${network}`);

    return validResults;
  }

    // jsDelivr API로 L2 주소 목록 동적 가져오기
  private async getL2AddressesFromJsDelivr(network: string): Promise<string[]> {
    // jsDelivr API URL (설정에서 가져오기)
    const apiUrl = this.jsDelivrApiUrl;

    try {
      console.log(`🌐 Fetching L2 list from jsDelivr: ${apiUrl}`);
      const response = await fetch(apiUrl, {
        signal: AbortSignal.timeout(this.timeout)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // data/network/*.json 파일들 필터링
      const pattern = `/data/${network}/`;
      const l2Files = data.files
        .filter((file: any) => file.name.includes(pattern) && file.name.endsWith('.json'))
        .map((file: any) => {
          // "/data/sepolia/0xAddress.json" -> "0xAddress"
          const fileName = file.name.split('/').pop().replace('.json', '');
          return fileName;
        });

      return l2Files;
    } catch (error) {
      console.error(`❌ Failed to fetch L2 addresses for ${network}:`, error);
      // 실패 시 빈 배열 반환
      return [];
    }
  }

    async getAvailableNetworks(): Promise<string[]> {
    // jsDelivr API로 네트워크 목록 동적 가져오기
    const apiUrl = this.jsDelivrApiUrl;

    try {
      console.log(`🌐 Fetching networks from jsDelivr: ${apiUrl}`);
      const response = await fetch(apiUrl, {
        signal: AbortSignal.timeout(this.timeout)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // /data/네트워크/ 형태의 디렉토리 찾기
      const networkDirs = new Set<string>();
      data.files.forEach((file: any) => {
        const match = file.name.match(/^\/data\/([^\/]+)\//);
        if (match) {
          networkDirs.add(match[1]);
        }
      });

      const networks = Array.from(networkDirs).sort();
      console.log(`📋 Found networks:`, networks);

      return networks;
    } catch (error) {
      console.error(`❌ Failed to fetch networks:`, error);
      // 실패 시 기본 네트워크 반환
      return ['sepolia', 'mainnet'];
    }
  }
}