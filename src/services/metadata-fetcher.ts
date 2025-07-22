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

    // GitHub Contents API → 실패 시 jsDelivr API fallback
  private async getL2AddressesFromJsDelivr(network: string): Promise<string[]> {
    // 1. GitHub Contents API 시도
    try {
      // repoUrl 예시: https://cdn.jsdelivr.net/gh/tokamak-network/tokamak-rollup-metadata-repository@main
      // → owner: tokamak-network, repo: tokamak-rollup-metadata-repository, branch: main
      const repoUrlPattern = /github\.com[:/](.+?)\/(.+?)(?:\.git)?$/;
      let owner = '';
      let repo = '';
      let branch = 'main';
      // repoUrl이 jsdelivr 형식이면 파싱
      if (this.repoUrl.includes('jsdelivr.net/gh/')) {
        // https://cdn.jsdelivr.net/gh/OWNER/REPO@BRANCH
        const m = this.repoUrl.match(/jsdelivr\.net\/gh\/([^\/]+)\/([^@]+)@([^/]+)/);
        if (m) {
          owner = m[1];
          repo = m[2];
          branch = m[3];
        }
      } else if (this.repoUrl.includes('github.com')) {
        // https://github.com/OWNER/REPO(.git)?
        const m = this.repoUrl.match(repoUrlPattern);
        if (m) {
          owner = m[1];
          repo = m[2];
        }
      }
      if (!owner || !repo) throw new Error('Cannot parse owner/repo from repoUrl');
      const contentsApiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/data/${network}?ref=${branch}`;
      console.log(`🌐 Fetching L2 list from GitHub Contents API: ${contentsApiUrl}`);
      const response = await fetch(contentsApiUrl, {
        signal: AbortSignal.timeout(this.timeout)
      });
      if (response.status === 403) throw new Error('rate_limit');
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('Unexpected response from GitHub Contents API');
      // .json 파일만 추출
      const l2Files = data
        .filter((file: any) => file.type === 'file' && file.name.endsWith('.json'))
        .map((file: any) => file.name.replace('.json', ''));
      return l2Files;
    } catch (error) {
      console.warn(`⚠️ GitHub Contents API failed, fallback to jsDelivr:`, error);
      // 2. jsDelivr API fallback (기존 로직)
      try {
        const apiUrl = this.jsDelivrApiUrl;
        console.log(`🌐 Fetching L2 list from jsDelivr: ${apiUrl}`);
        const response = await fetch(apiUrl, {
          signal: AbortSignal.timeout(this.timeout)
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        const pattern = `/data/${network}/`;
        const l2Files = data.files
          .filter((file: any) => file.name.includes(pattern) && file.name.endsWith('.json'))
          .map((file: any) => {
            const fileName = file.name.split('/').pop().replace('.json', '');
            return fileName;
          });
        return l2Files;
      } catch (error2) {
        console.error(`❌ Failed to fetch L2 addresses for ${network}:`, error2);
        return [];
      }
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