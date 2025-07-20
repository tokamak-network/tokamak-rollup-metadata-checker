import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { MetadataFetcher } from '@/services/metadata-fetcher';
import { L2Status } from '@/types/metadata';
import { config } from '@/config';
import { getLatestBlocks, isValidRpcUrl } from '@/utils/rpc';

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

        // 각 L2의 실제 블록 데이터 가져오기 (병렬 처리, 유효한 RPC만)
        const blockDataPromises = selectedMetadata
          .filter(meta => {
            // 유효하지 않은 RPC URL은 건너뛰기
            const isValid = isValidRpcUrl(meta.rpcUrl);
            if (!isValid) {
              console.log(`⚠️ Skipping ${meta.name} due to invalid RPC URL: ${meta.rpcUrl}`);
            }
            return isValid;
          })
          .map(async (meta) => {
            console.log(`🔗 Fetching blocks for ${meta.name} (L1 Chain: ${meta.l1ChainId}, L2 RPC: ${meta.rpcUrl})`);
            try {
              const blocks = await getLatestBlocks(meta.rpcUrl, meta.l1ChainId);
              console.log(`📊 ${meta.name} - L1: ${blocks.l1Block}, L2: ${blocks.l2Block}`);
              return { meta, blocks };
            } catch (error) {
              console.error(`❌ Failed to fetch blocks for ${meta.name}:`, error);
              return { meta, blocks: { l1Block: 0, l2Block: 0 } };
            }
          });

        const blockDataResults = await Promise.allSettled(blockDataPromises);

        // 유효한 RPC를 가진 메타데이터와 유효하지 않은 RPC를 가진 메타데이터 모두 처리
        const validRpcMetadata = selectedMetadata.filter(meta => isValidRpcUrl(meta.rpcUrl));
        const invalidRpcMetadata = selectedMetadata.filter(meta => !isValidRpcUrl(meta.rpcUrl));

        // 유효한 RPC를 가진 메타데이터 처리
        const validStatuses = blockDataResults.map((result, index) => {
          const meta = validRpcMetadata[index];
          const blocks = result.status === 'fulfilled' ? result.value.blocks : { l1Block: 0, l2Block: 0 };

          return {
            l1ChainId: meta.l1ChainId,
            l2ChainId: meta.l2ChainId,
            name: meta.name,
            systemConfigAddress: meta.l1Contracts.systemConfig,
            rollupType: meta.rollupType,
            status: meta.status,
            isActive: meta.status === 'active',
            latestL2Block: blocks.l2Block,
            latestL1Block: blocks.l1Block,
            lastProposalTime: Date.now() - Math.floor(Math.random() * 3600000), // 임시: 실제 구현 필요
            lastBatchTime: Date.now() - Math.floor(Math.random() * 300000), // 임시: 실제 구현 필요
            sequencerStatus: meta.status === 'active' ? 'active' as const : 'inactive' as const,
            proposerStatus: meta.status === 'active' ? 'active' as const : 'inactive' as const,
            withdrawalDelayStatus: 'normal' as const,
            systemConfigStatus: meta.status === 'active' ? 'active' as const : 'paused' as const,
            rpcStatus: blocks.l2Block > 0 ? 'healthy' as const : 'unhealthy' as const,
            explorerStatus: 'unknown' as const,
            bridgeStatus: 'unknown' as const,
            stakingStatus: meta.staking.isCandidate ? 'candidate' as const : 'not_candidate' as const,
            lastChecked: new Date(),
            errors: result.status === 'rejected' ? [result.reason?.message || 'Unknown error'] : []
          };
        });

        // 유효하지 않은 RPC를 가진 메타데이터 처리 (L1 블록은 여전히 가져오기)
        const invalidStatusPromises = invalidRpcMetadata.map(async (meta) => {
          let l1Block = 0;
          try {
            console.log(`🌐 Fetching L1 block for ${meta.name} (invalid L2 RPC)`);
            const { getL1LatestBlock } = await import('@/utils/rpc');
            l1Block = await getL1LatestBlock(meta.l1ChainId);
            console.log(`✅ L1 block fetched for ${meta.name}: ${l1Block}`);
          } catch (error) {
            console.error(`❌ Failed to fetch L1 block for ${meta.name}:`, error);
          }

          return {
            l1ChainId: meta.l1ChainId,
            l2ChainId: meta.l2ChainId,
            name: meta.name,
            systemConfigAddress: meta.l1Contracts.systemConfig,
            rollupType: meta.rollupType,
            status: meta.status,
            isActive: meta.status === 'active',
            latestL2Block: 0,
            latestL1Block: l1Block,
            lastProposalTime: Date.now() - Math.floor(Math.random() * 3600000),
            lastBatchTime: Date.now() - Math.floor(Math.random() * 300000),
            sequencerStatus: meta.status === 'active' ? 'active' as const : 'inactive' as const,
            proposerStatus: meta.status === 'active' ? 'active' as const : 'inactive' as const,
            withdrawalDelayStatus: 'normal' as const,
            systemConfigStatus: meta.status === 'active' ? 'active' as const : 'paused' as const,
            rpcStatus: 'unhealthy' as const, // 유효하지 않은 RPC
            explorerStatus: 'unknown' as const,
            bridgeStatus: 'unknown' as const,
            stakingStatus: meta.staking.isCandidate ? 'candidate' as const : 'not_candidate' as const,
            lastChecked: new Date(),
            errors: [`Invalid RPC URL: ${meta.rpcUrl}`]
          };
        });

        const invalidStatuses = await Promise.all(invalidStatusPromises);

        // 모든 상태 합치기
        const statuses = [...validStatuses, ...invalidStatuses];
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