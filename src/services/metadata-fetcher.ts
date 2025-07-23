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

  // GitHub Contents API로 L2 주소 목록 가져오기
  async getL2AddressesFromGitHub(network: string): Promise<string[]> {
    try {
      const repoUrlPattern = /github\.com[:/](.+?)\/(.+?)(?:\.git)?$/;
      let owner = '';
      let repo = '';
      let branch = 'main';
      if (this.repoUrl.includes('jsdelivr.net/gh/')) {
        const m = this.repoUrl.match(/jsdelivr\.net\/gh\/([^\/]+)\/([^@]+)@([^/]+)/);
        if (m) {
          owner = m[1];
          repo = m[2];
          branch = m[3];
        }
      } else if (this.repoUrl.includes('github.com')) {
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
        signal: AbortSignal.timeout(this.timeout),
        cache: 'no-store'
      });
      if (response.status === 403) throw new Error('rate_limit');
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();

      console.log('data', data);
      if (!Array.isArray(data)) throw new Error('Unexpected response from GitHub Contents API');
      const l2Files = data
        .filter((file: any) => file.type === 'file' && file.name.endsWith('.json'))
        .map((file: any) => file.name.replace('.json', ''));
      return l2Files;
    } catch (error) {
      console.warn(`⚠️ GitHub Contents API failed:`, error);
      return [];
    }
  }

  // jsDelivr API로 L2 주소 목록 가져오기
  async getL2AddressesFromJsDelivr(network: string): Promise<string[]> {
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
    } catch (error) {
      console.error(`❌ Failed to fetch L2 addresses from jsDelivr for ${network}:`, error);
      return [];
    }
  }

  // fetchAllMetadata에서 주소 소스를 명시적으로 선택할 수 있도록 수정
  async fetchAllMetadata(network: string): Promise<RollupMetadata[]> {
    // 1. GitHub Contents API 시도
    let l2Addresses = await this.getL2AddressesFromGitHub(network);
    // 2. 결과가 빈 배열이면 jsDelivr로 fallback
    if (l2Addresses.length === 0) {
      l2Addresses = await this.getL2AddressesFromJsDelivr(network);
    }

    console.log(`📋 Found ${l2Addresses.length} L2s in ${network}:`, l2Addresses);

    if (l2Addresses.length === 0) {
      console.warn(`⚠️ No L2s found for network: ${network}`);
      return [];
    }

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