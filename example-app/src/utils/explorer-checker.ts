export interface ExplorerStatus {
  name: string;
  url: string;
  type: 'blockscout' | 'etherscan' | 'custom';
  isActive: boolean;
  responseTime?: number;
  error?: string;
}

export async function checkExplorerStatus(explorer: {
  name: string;
  url: string;
  type: 'blockscout' | 'etherscan' | 'custom';
}): Promise<ExplorerStatus> {
  const startTime = Date.now();

  try {
    // URL 기본 유효성 검사
    const urlObj = new URL(explorer.url);

    // 기본적인 도메인 검사
    if (!urlObj.hostname || urlObj.hostname === 'localhost' || urlObj.hostname === 'example.com') {
      throw new Error('Invalid domain');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3초로 단축

    // 먼저 간단한 GET 요청으로 테스트 (CORS 허용하는 경우)
    try {
      const response = await fetch(explorer.url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'text/html,application/xhtml+xml',
          'User-Agent': 'Mozilla/5.0 (compatible; StatusChecker/1.0)'
        }
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      // HTTP 상태 코드 확인
      if (response.ok || response.status === 200) {
        return {
          name: explorer.name,
          url: explorer.url,
          type: explorer.type,
          isActive: true,
          responseTime
        };
      } else {
        return {
          name: explorer.name,
          url: explorer.url,
          type: explorer.type,
          isActive: false,
          responseTime,
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }
    } catch (corsError) {
      // CORS 에러인 경우, 이미지 로딩으로 도메인 존재 여부 확인
      clearTimeout(timeoutId);

      return new Promise((resolve) => {
        const img = new Image();
        const testStartTime = Date.now();

        const cleanup = () => {
          img.onload = null;
          img.onerror = null;
        };

        img.onload = () => {
          cleanup();
          resolve({
            name: explorer.name,
            url: explorer.url,
            type: explorer.type,
            isActive: true,
            responseTime: Date.now() - testStartTime
          });
        };

        img.onerror = () => {
          cleanup();
          resolve({
            name: explorer.name,
            url: explorer.url,
            type: explorer.type,
            isActive: false,
            responseTime: Date.now() - testStartTime,
            error: 'Domain not reachable'
          });
        };

        // favicon 또는 간단한 리소스 테스트
        img.src = `${urlObj.origin}/favicon.ico?t=${Date.now()}`;

        // 5초 후 타임아웃
        setTimeout(() => {
          cleanup();
          resolve({
            name: explorer.name,
            url: explorer.url,
            type: explorer.type,
            isActive: false,
            responseTime: Date.now() - testStartTime,
            error: 'Connection timeout'
          });
        }, 5000);
      });
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;

    return {
      name: explorer.name,
      url: explorer.url,
      type: explorer.type,
      isActive: false,
      responseTime,
      error: error instanceof Error ? error.message : 'Invalid URL'
    };
  }
}

export async function checkAllExplorers(explorers: Array<{
  name: string;
  url: string;
  type: 'blockscout' | 'etherscan' | 'custom';
}>): Promise<ExplorerStatus[]> {
  if (!explorers || explorers.length === 0) {
    return [];
  }

  const promises = explorers.map(explorer => checkExplorerStatus(explorer));
  const results = await Promise.allSettled(promises);

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        name: explorers[index].name,
        url: explorers[index].url,
        type: explorers[index].type,
        isActive: false,
        error: result.reason?.message || 'Failed to check status'
      };
    }
  });
}