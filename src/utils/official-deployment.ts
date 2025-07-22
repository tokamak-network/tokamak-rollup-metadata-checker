import { OFFICIAL_BYTECODE_BASE_URL, LOCAL_BYTECODE_PATH } from '../config/constants';


// 타입가드: Node.js 환경인지 확인
function isNode() {
  return typeof process !== "undefined" && process.versions != null && process.versions.node != null;
}

export async function fetchOfficialDeployment(contractName: string, network: 'mainnet' | 'sepolia' = 'mainnet') {
  const proxyTypes = ["Proxy", "ResolvedDelegateProxy", "L1ChugSplashProxy", "L1UsdcBridgeProxy"];
  if (proxyTypes.includes(contractName)) {
    const fileUrl = `${LOCAL_BYTECODE_PATH}${contractName}.json`;
    if (isNode()) {
      // Node.js (테스트, API 서버)에서는 파일 시스템으로 읽기
      const { readFile } = await import("fs/promises");
      const path = await import("path");
      const filePath = path.join(process.cwd(), "public", "bytecodes", `${contractName}.json`);
      const file = await readFile(filePath, "utf-8");
      return JSON.parse(file);
    } else {
      // 브라우저/클라이언트에서는 fetch 사용
      const res = await fetch(fileUrl);
      if (!res.ok) throw new Error(`Failed to fetch official deployment for ${contractName}`);
      return await res.json();
    }
  } else {
    let network_dir = network === 'mainnet' ? 'mainnet' : 'thanos-sepolia';
    const url = `${OFFICIAL_BYTECODE_BASE_URL}/${network_dir}/${contractName}.json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch official deployment for ${contractName}`);
    return await res.json();
  }
}
