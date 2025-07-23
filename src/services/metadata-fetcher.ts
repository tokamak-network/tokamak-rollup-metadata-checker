import { RollupMetadata } from '../types/metadata';
import { fetchGithubDirItemsFromHtml , fetchGithubMetadataFromHtml} from '@/utils/git-crawling';

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

    try {
      const metadata = await fetchGithubMetadataFromHtml(network, systemConfigAddress.toLowerCase());
      console.log('metadata', metadata);
      return metadata as RollupMetadata;
    } catch (error) {
      throw new Error(`Failed to fetch metadata for ${systemConfigAddress} on ${network}: ${error}`);
    }
  }

  // fetchAllMetadata에서 주소 소스를 명시적으로 선택할 수 있도록 수정
  async fetchAllMetadata(network: string): Promise<RollupMetadata[]> {
    // 1. GitHub Contents API 시도
    // let l2Addresses = await this.getL2AddressesFromGitHub(network);
    let l2Addresses = await fetchGithubDirItemsFromHtml(network);

    console.log(`📋 Found ${l2Addresses.length} L2s in ${network}:`, l2Addresses);

    if (l2Addresses.length === 0) {
      console.warn(`⚠️ No L2s found for network: ${network}`);
      return [];
    }
    let results = [];
    for(const address of l2Addresses) {
      const metadata = await fetchGithubMetadataFromHtml(network, address);
      console.log('metadata', metadata);
      results.push(metadata);
    }

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