import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/config';
import { RollupMetadata, L2Status } from '@/types/metadata';
import { getNetworkStats, isValidRpcUrl } from '@/utils/rpc';
import { checkAllExplorers, ExplorerStatus } from '@/utils/explorer-checker';
import { getContractTimestamps, getEstimatedTimestamps } from '@/utils/contract-calls';
import { verifySequencerAddress } from '@/utils/system-config';
import {fetchGithubMetadataFromHtml, fetchGithubDirItemsFromHtml } from "@/utils/git-crawling"

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;
    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      );
    }
    // 네트워크 정보는 쿼리 파라미터에서, 없으면 sepolia
    const { searchParams } = new URL(request.url);
    const network = searchParams.get('network') || 'sepolia';

    let metadata: RollupMetadata | null = null;
    let fetchError: any = null;

    // 1. fetchGithubMetadataFromHtml(network: string, address: string)

    try{
      metadata =  await fetchGithubMetadataFromHtml(network, address)
    } catch(e){
      fetchError += ` | raw: HTTP fetchGithubMetadataFromHtml `;
    }

    if (!metadata) {
      return NextResponse.json(
        { error: 'L2 rollup not found', fetchError },
        { status: 404 }
      );
    }
    console.log(`✅ Successfully loaded metadata for ${metadata.name}`);

    // Fetch real network data from L1 and L2 RPCs
    let blocks = { l1Block: 0, l2Block: 0 };
    let actualBlockTime = 0;
    let actualGasLimit = 0;

    // Always try to fetch L1 block, regardless of L2 RPC validity
    console.log(`🌐 Fetching L1 block for ${metadata.name} (Chain ID: ${metadata.l1ChainId})`);
    try {
      const { getL1LatestBlock } = await import('@/utils/rpc');
      blocks.l1Block = await getL1LatestBlock(metadata.l1ChainId);
      console.log(`✅ L1 block fetched: ${blocks.l1Block}`);
    } catch (error) {
      console.error(`❌ Failed to fetch L1 block for ${metadata.name}:`, error);
    }

    // Fetch L2 data only if RPC is valid
    if (isValidRpcUrl(metadata.rpcUrl)) {
      console.log(`🔗 Fetching L2 network stats for ${metadata.name} (L2 RPC: ${metadata.rpcUrl})`);
      try {
        const networkStats = await getNetworkStats(metadata.rpcUrl, metadata.l1ChainId);
        // Keep the L1 block we already fetched, only update L2 block and other stats
        blocks.l2Block = networkStats.blocks.l2Block;
        actualBlockTime = networkStats.actualBlockTime;
        actualGasLimit = networkStats.actualGasLimit;
        console.log(`📊 L2 network stats - L2 Block: ${blocks.l2Block}, Block Time: ${actualBlockTime}s, Gas Limit: ${actualGasLimit}`);
      } catch (error) {
        console.error(`❌ Failed to fetch L2 network stats for ${metadata.name}:`, error);
      }
    } else {
      console.log(`⚠️ Skipping L2 network stats for ${metadata.name} due to invalid RPC URL: ${metadata.rpcUrl}`);
    }

        // Fetch contract timestamps (proposal and batch times) - 유효한 RPC만
    console.log(`⏰ Fetching contract timestamps for ${metadata.name}...`);
    let contractTimestamps = { lastProposalTime: 0, lastBatchTime: 0 };
    let proposalError: string | undefined;
    let batchError: string | undefined;

    if (isValidRpcUrl(metadata.rpcUrl)) {
      try {
        // L1 RPC URL 가져오기
        const l1RpcUrl = metadata.l1ChainId === 1
          ? process.env.MAINNET_RPC_URL || 'https://ethereum.publicnode.com'
          : process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia.publicnode.com';

        // 실제 컨트랙트 이벤트에서 시간 가져오기 시도
        if (metadata.l1Contracts.L2OutputOracle) {
          contractTimestamps = await getContractTimestamps(
            l1RpcUrl,
            metadata.rpcUrl,
            metadata.l1Contracts.L2OutputOracle,
            metadata.sequencer.address,
            metadata.l1ChainId
          );
        } else {
          console.log(`⚠️ L2OutputOracle address not found, using block-based estimation`);
          contractTimestamps = await getEstimatedTimestamps(l1RpcUrl, metadata.rpcUrl, metadata.l1ChainId);
        }

        // 컨트랙트 호출이 실패하면 블록 기반으로 추정
        if (contractTimestamps.lastProposalTime === 0 && contractTimestamps.lastBatchTime === 0) {
          console.log(`⚠️ Contract calls failed, using block-based estimation`);
          contractTimestamps = await getEstimatedTimestamps(l1RpcUrl, metadata.rpcUrl, metadata.l1ChainId);
        }

        // 에러 메시지 설정
        if (contractTimestamps.lastProposalTime === 0) {
          proposalError = 'No proposal events found or RPC failed';
        }
        if (contractTimestamps.lastBatchTime === 0) {
          batchError = 'No batch events found or RPC failed';
        }

        console.log(`📊 Contract timestamps - Proposal: ${new Date(contractTimestamps.lastProposalTime).toISOString()}, Batch: ${new Date(contractTimestamps.lastBatchTime).toISOString()}`);
      } catch (error) {
        console.warn('⚠️ Failed to fetch contract timestamps, using fallback:', error);
        proposalError = `Contract call failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        batchError = `Contract call failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    } else {
      console.log(`⚠️ Skipping contract timestamps for ${metadata.name} due to invalid RPC URL: ${metadata.rpcUrl}`);
      proposalError = `Invalid RPC URL: ${metadata.rpcUrl}`;
      batchError = `Invalid RPC URL: ${metadata.rpcUrl}`;
    }

    // Check explorer statuses (메타데이터 우선, 실제 테스트는 보조)
    console.log(`🔍 Checking explorer statuses for ${metadata.name}...`);
    const metadataActiveExplorers = metadata.explorers?.filter(e => e.status === 'active') || [];
    const metadataActiveBridges = metadata.bridges?.filter(b => b.status === 'active') || [];
    let explorerStatuses: any[] = [];

    if (metadata.explorers && metadata.explorers.length > 0) {
      try {
        // 실제 접속 테스트 (시간 제한)
        const testPromise = checkAllExplorers(metadata.explorers);
        const timeoutPromise = new Promise(resolve =>
          setTimeout(() => resolve([]), 8000) // 8초 타임아웃
        );

        explorerStatuses = await Promise.race([testPromise, timeoutPromise]) as any[];
      } catch (error) {
        console.warn('⚠️ Explorer connectivity test failed:', error);
        explorerStatuses = [];
      }
    }

    console.log(`📊 Explorer status - Metadata: ${metadataActiveExplorers.length}/${metadata.explorers?.length || 0}, Tested: ${explorerStatuses.filter(e => e.isActive).length}/${explorerStatuses.length}`);
    console.log(`🌉 Bridge status - Metadata: ${metadataActiveBridges.length}/${metadata.bridges?.length || 0} active`);

    // Verify sequencer address against SystemConfig contract
    console.log(`🔐 Verifying sequencer address for ${metadata.name}...`);

    console.log(`🔐 Verifying sequencer address `, metadata.l1Contracts.SystemConfig, metadata.sequencer.address);



    const sequencerVerification = await verifySequencerAddress(
      metadata.l1Contracts.SystemConfig ,
      metadata.sequencer.address,
      metadata.l1ChainId
    );

    let sequencerStatus: 'active' | 'inactive' | 'unknown' = 'unknown';
    if (sequencerVerification.isVerified) {
      sequencerStatus = metadata.status === 'active' ? 'active' : 'inactive';
    } else if (sequencerVerification.error) {
      sequencerStatus = 'unknown';
    } else {
      sequencerStatus = 'inactive'; // Different from on-chain
    }

    // Simulate health checks (similar to the main rollups API)
    const rollupStatus: L2Status = {
      l1ChainId: metadata.l1ChainId,
      l2ChainId: metadata.l2ChainId,
      name: metadata.name,
      systemConfigAddress: metadata.l1Contracts.SystemConfig,
      rollupType: metadata.rollupType,
      status: metadata.status,
      isActive: metadata.status === 'active',
      latestL2Block: blocks.l2Block,
      latestL1Block: blocks.l1Block,
      lastProposalTime: contractTimestamps.lastProposalTime,
      lastBatchTime: contractTimestamps.lastBatchTime,
      proposalError,
      batchError,
      sequencerStatus,
      sequencerVerified: sequencerVerification.isVerified,
      sequencerVerificationError: sequencerVerification.error,
      actualSequencerAddress: sequencerVerification.actualSequencer,
      proposerStatus: metadata.status === 'active' ? 'active' : 'inactive',
      withdrawalDelayStatus: 'normal',
      systemConfigStatus: metadata.status === 'active' ? 'active' : 'paused',
      rpcStatus: blocks.l2Block > 0 ? 'healthy' : 'unhealthy',
      explorerStatus: metadataActiveExplorers.length > 0 ? 'healthy' : 'unhealthy',
      bridgeStatus: metadataActiveBridges.length > 0 ? 'healthy' : 'unavailable',
      stakingStatus: metadata.staking.isCandidate ? 'candidate' : 'not_candidate',
      lastChecked: new Date(),
      errors: []
    };

    return NextResponse.json({
      metadata,
      status: rollupStatus,
      actualStats: {
        actualBlockTime,
        actualGasLimit
      },
      explorerStatuses
    });

  } catch (error) {
    console.error('❌ Error fetching rollup details:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}