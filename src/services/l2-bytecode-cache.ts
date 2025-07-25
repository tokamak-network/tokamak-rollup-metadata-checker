
import {L2_CONTRACT_NAMES, L2_BYTECODE_RAW_URL_TEMPLATE} from '@/config/index';
import { fetchL2BytecodeFromGithub } from '@/utils/git-crawling';
/**
 * L2 컨트랙트 바이트코드 캐시 서비스
 * 앱 시작 시 jsDelivr에서 모든 바이트코드를 읽어와 메모리에 저장합니다.
 */

export interface L2BytecodeInfo {
  name: string; // 파일명 (예: OptimismPortalProxy.json)
  bytecode: string; // 바이트코드(hex)
}

class L2BytecodeCache {
  private bytecodeMap: Map<string, string> = new Map();
  private initialized = false;

  /**
   * jsDelivr API를 통해 L2 바이트코드 디렉토리의 모든 파일을 읽어와 캐싱
   */
  async initialize() {
    if (this.initialized) return;

    for (const file of L2_CONTRACT_NAMES) {
      let res = await fetchL2BytecodeFromGithub( file);
      if (!res) continue;
      // console.log('L1BytecodeCache initialize res', file, res, res.bytecode);

      if (res.bytecode) {
        this.bytecodeMap.set(file.replace('.json', ''), res.bytecode);
      }

    }

    this.initialized = true;
  }

  /**
   * 컨트랙트 이름으로 바이트코드(hex) 반환
   */
  getBytecode(contractName: string): string | undefined {
    return this.bytecodeMap.get(contractName);
  }

  /**
   * 온체인 바이트코드와 기준 바이트코드 비교
   */
  compareBytecode(contractName: string, onchainBytecode: string): boolean {
    const ref = this.getBytecode(contractName);
    if (!ref) return false;
    // 0x 접두어 제거 후 비교
    return ref.replace(/^0x/, '') === onchainBytecode.replace(/^0x/, '');
  }
}

export const l2BytecodeCache = new L2BytecodeCache();