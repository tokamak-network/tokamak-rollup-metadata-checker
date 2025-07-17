import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { MetadataFetcher } from '@/services/metadata-fetcher';
import { L2Status } from '@/types/metadata';
import { config } from '@/config';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const selectedAddresses = searchParams.get('addresses')?.split(',').filter(Boolean) || [];

  console.log('🔗 API /rollups called with addresses:', selectedAddresses);

  // 선택된 L2가 없으면 빈 배열 반환
  if (selectedAddresses.length === 0) {
    console.log('⚠️ No addresses provided, returning empty array');
    return NextResponse.json([]);
  }
  try {
    const fetcher = new MetadataFetcher(config.metadataRepoUrl, config.jsDelivrApiUrl, config.timeout);

    // 실제 존재하는 네트워크 목록을 동적으로 가져옴
    let networks: string[] = [];
    try {
      networks = await fetcher.getAvailableNetworks();
    } catch (error) {
      console.warn('Failed to fetch available networks, using default:', error);
      networks = ['sepolia']; // 기본값으로 sepolia만 사용
    }

    const rollupStatuses: L2Status[] = [];

    for (const network of networks) {
      try {
        const metadata = await fetcher.fetchAllMetadata(network);

        // 선택된 주소들만 필터링
        const selectedMetadata = metadata.filter(meta =>
          selectedAddresses.includes(meta.l1Contracts.systemConfig)
        );

        // 메타데이터를 L2Status로 변환
        const statuses = selectedMetadata.map(meta => ({
          l1ChainId: meta.l1ChainId,
          l2ChainId: meta.l2ChainId,
          name: meta.name,
          systemConfigAddress: meta.l1Contracts.systemConfig,
          rollupType: meta.rollupType,
          status: meta.status,
          isActive: meta.status === 'active',
          latestL2Block: 0, // TODO: 실제 RPC 호출로 구현
          latestL1Block: 0, // TODO: 실제 RPC 호출로 구현
          lastProposalTime: 0, // TODO: 컨트랙트 호출로 구현
          lastBatchTime: 0, // TODO: 컨트랙트 호출로 구현
          sequencerStatus: 'unknown' as const,
          proposerStatus: 'unknown' as const,
          withdrawalDelayStatus: 'unknown' as const,
          systemConfigStatus: 'unknown' as const,
          rpcStatus: 'unknown' as const,
          explorerStatus: 'unknown' as const,
          bridgeStatus: 'unknown' as const,
          stakingStatus: meta.staking.isCandidate ? 'candidate' as const : 'not_candidate' as const,
          lastChecked: new Date(),
          errors: []
        }));

        rollupStatuses.push(...statuses);
      } catch (error) {
        console.error(`Failed to fetch metadata for network ${network}:`, error);
      }
    }

    console.log('📤 API returning rollup statuses:', rollupStatuses.length, 'items');
    return NextResponse.json(rollupStatuses);
  } catch (error) {
    console.error('Error fetching rollup data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rollup data' },
      { status: 500 }
    );
  }
}