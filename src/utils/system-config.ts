// SystemConfig contract ABI for unsafeBlockSigner function
const SYSTEM_CONFIG_ABI = [
  {
    "inputs": [],
    "name": "unsafeBlockSigner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export interface SequencerVerification {
  isVerified: boolean;
  actualSequencer?: string;
  error?: string;
}

export async function verifySequencerAddress(
  systemConfigAddress: string,
  metadataSequencerAddress: string,
  l1ChainId: number
): Promise<SequencerVerification> {
  try {
    // L1 RPC URL 가져오기
    const l1RpcUrl = l1ChainId === 1
      ? process.env.MAINNET_RPC_URL || 'https://ethereum.publicnode.com'
      : process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia.publicnode.com';

    // JSON-RPC 요청으로 unsafeBlockSigner 호출
    const response = await fetch(l1RpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [
          {
            to: systemConfigAddress,
            data: '0x1fd19ee1' // unsafeBlockSigner() function selector
          },
          'latest'
        ],
        id: 1
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.error) {
      throw new Error(result.error.message || 'Contract call failed');
    }

    if (!result.result || result.result === '0x') {
      throw new Error('No data returned from contract');
    }

    // 결과를 주소로 파싱 (32바이트에서 마지막 20바이트)
    const actualSequencer = `0x${result.result.slice(-40)}`.toLowerCase();
    const metadataSequencer = metadataSequencerAddress.toLowerCase();

    console.log(`🔍 Sequencer verification: actual=${actualSequencer}, metadata=${metadataSequencer}`);

    return {
      isVerified: actualSequencer === metadataSequencer,
      actualSequencer,
    };

  } catch (error) {
    console.error('❌ Failed to verify sequencer address:', error);
    return {
      isVerified: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}