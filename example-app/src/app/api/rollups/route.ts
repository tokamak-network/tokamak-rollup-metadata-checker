import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { MetadataFetcher } from '@/services/metadata-fetcher';
import { L2Status } from '@/types/metadata';
import { config } from '@/config';
import { isValidRpcUrl } from '@/utils/rpc';
import { ethers } from 'ethers';
import { fetchGithubMetadataFromHtml, fetchGithubDirItemsFromHtml, fetchAllMetadata } from '@/utils/git-crawling';

// Utility function to check L2 RPC health via /api/rpc-health
async function checkRpcHealth(rpcUrl: string): Promise<{rpcStatus: 'healthy' | 'unhealthy' | 'unknown', errors: string[]}> {
  let rpcStatus: 'healthy' | 'unhealthy' | 'unknown' = 'unknown';
  let errors: string[] = [];
  if (!isValidRpcUrl(rpcUrl)) {
    rpcStatus = 'unhealthy';
    errors.push('Invalid RPC URL');
    return { rpcStatus, errors };
  }

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl, undefined, {
      staticNetwork: true,
      polling: false // 폴링 비활성화로 에러 로그 감소
    });
    let blockNumber, block, gasLimit, blockTime;
    try {
      blockNumber = await provider.getBlockNumber();
      block = await provider.getBlock(blockNumber);
      gasLimit = block?.gasLimit?.toString();
      blockTime = block?.timestamp;
    } catch (e) {
      rpcStatus = 'unhealthy';
      errors.push(e instanceof Error ? e.message : String(e));
    }
    if (blockNumber && gasLimit && blockTime && gasLimit !== '0' && blockTime !== 0) {
      rpcStatus = 'healthy';
    } else {
      rpcStatus = 'unhealthy';
    }
  } catch (error) {
    rpcStatus = 'unhealthy';
    errors.push(error instanceof Error ? error.message : String(error));
  }

  return { rpcStatus, errors };
}

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
    const fetcher = new MetadataFetcher(config.jsDelivrApiUrl, config.timeout);

    // 실제 존재하는 네트워크 목록을 동적으로 가져옴
    let networks: string[] = [];
    try {
      networks = await fetcher.getAvailableNetworks();
    } catch (error) {
      console.warn('Failed to fetch available networks, using default:', error);
      networks = ['sepolia']; // 기본값으로 sepolia만 사용
    }
    console.log('networks', networks);

    const rollupStatuses: L2Status[] = [];

    for (const network of networks) {
      try {
        // const metadata = await fetcher.fetchAllMetadata(network);
        const metadata = await fetchAllMetadata(network);
        // console.log('metadata', metadata);

        if(metadata.length === 0) {
          console.log('⚠️ No metadata found for network:', network);
          continue;
        }
        // 선택된 주소들만 필터링
        const selectedMetadata = metadata.filter(meta =>
          selectedAddresses.includes(meta.l1Contracts.SystemConfig)
        );
        // console.log('selectedMetadata', selectedMetadata);

        // 각 L2의 RPC 상태를 /api/rpc로 판단
        const rpcStatusPromises = selectedMetadata.map(async (meta) => {
          const { rpcStatus, errors } = await checkRpcHealth(meta.rpcUrl);

          // Defensive: fallback for missing fields in meta (use meta.staking, meta.sequencer, etc.)
          const isActive = meta.status === 'active';
          // const stakingStatus = meta.staking?.candidateStatus ?? 'not_candidate';

          return {
            l1ChainId: meta.l1ChainId,
            l2ChainId: meta.l2ChainId,
            name: meta.name,
            systemConfigAddress: meta.l1Contracts.SystemConfig,
            rollupType: meta.rollupType,
            status: meta.status,
            stakingStatus: meta.staking?.candidateStatus??  'not_candidate',
            isActive,
            latestL2Block: 0,
            latestL1Block: 0,
            rpcStatus,
            lastChecked: new Date(),
            errors,
          };
        });
        const rpcStatuses = await Promise.all(rpcStatusPromises);
        rollupStatuses.push(...rpcStatuses);
      } catch (error) {
        console.error(`1 Failed to fetch metadata for network ${network}:`, error);
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