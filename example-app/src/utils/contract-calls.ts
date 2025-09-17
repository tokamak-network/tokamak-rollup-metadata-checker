import { ethers } from 'ethers';
import { isValidRpcUrl } from './rpc';

// L2OutputOracle ABI - OutputProposed 이벤트
const L2_OUTPUT_ORACLE_ABI = [
  'event OutputProposed(bytes32 indexed outputRoot, uint256 indexed l2OutputIndex, uint256 indexed l2BlockNumber, uint256 l1Timestamp)'
];

// Sequencer ABI - TransactionBatchAppended 이벤트
const SEQUENCER_ABI = [
  'event TransactionBatchAppended(uint256 indexed _batchIndex, bytes32 _batchRoot, uint256 _batchSize, uint256 _prevTotalElements, bytes _extraData)'
];

export interface ContractTimestamps {
  lastProposalTime: number;
  lastBatchTime: number;
}

export async function getContractTimestamps(
  l1RpcUrl: string,
  l2RpcUrl: string,
  l2OutputOracleAddress: string,
  sequencerAddress: string,
  l1ChainId: number
): Promise<ContractTimestamps> {
  try {

    // RPC URL 유효성 검사
    if (!isValidRpcUrl(l1RpcUrl)) {
      console.warn(`⚠️ Invalid L1 RPC URL: ${l1RpcUrl}`);
      throw new Error(`Invalid L1 RPC URL: ${l1RpcUrl}`);
    }

    if (!isValidRpcUrl(l2RpcUrl)) {
      console.warn(`⚠️ Invalid L2 RPC URL: ${l2RpcUrl}`);
      throw new Error(`Invalid L2 RPC URL: ${l2RpcUrl}`);
    }

    // L1 Provider 설정 (재시도 비활성화, 에러 로그 억제)
    const l1Provider = new ethers.JsonRpcProvider(l1RpcUrl, undefined, {
      staticNetwork: true,
      batchMaxCount: 1,
      batchStallTime: 0,
      polling: false // 폴링 비활성화로 에러 로그 감소
    });

    // L2 Provider 설정 (재시도 비활성화, 에러 로그 억제)
    const l2Provider = new ethers.JsonRpcProvider(l2RpcUrl, undefined, {
      staticNetwork: true,
      batchMaxCount: 1,
      batchStallTime: 0,
      polling: false // 폴링 비활성화로 에러 로그 감소
    });

    // RPC 연결 테스트
    try {
      await l1Provider.getBlockNumber();
      await l2Provider.getBlockNumber();
    } catch (error) {
      throw error;
    }

    // L2OutputOracle 컨트랙트 인스턴스 (L1에서)
    const l2OutputOracle = new ethers.Contract(
      l2OutputOracleAddress,
      L2_OUTPUT_ORACLE_ABI,
      l1Provider
    );

    // Sequencer 컨트랙트 인스턴스 (L2에서)
    const sequencer = new ethers.Contract(
      sequencerAddress,
      SEQUENCER_ABI,
      l2Provider
    );

    // 최신 블록 번호 가져오기
    const [l1LatestBlock, l2LatestBlock] = await Promise.all([
      l1Provider.getBlockNumber(),
      l2Provider.getBlockNumber()
    ]);

    // 최근 1000개 블록에서 이벤트 검색
    const searchBlocks = 1000;
    const l1FromBlock = Math.max(0, l1LatestBlock - searchBlocks);
    const l2FromBlock = Math.max(0, l2LatestBlock - searchBlocks);

    console.log(`🔍 Searching events from L1 block ${l1FromBlock} to ${l1LatestBlock}`);
    console.log(`🔍 Searching events from L2 block ${l2FromBlock} to ${l2LatestBlock}`);

    // 병렬로 이벤트 가져오기
    const [proposalEvents, batchEvents] = await Promise.allSettled([
      // L1에서 L2 → L1 proposal 이벤트 (OutputProposed)
      l2OutputOracle.queryFilter(
        l2OutputOracle.filters.OutputProposed(),
        l1FromBlock,
        l1LatestBlock
      ),
      // L2에서 batch submission 이벤트 (TransactionBatchAppended)
      sequencer.queryFilter(
        sequencer.filters.TransactionBatchAppended(),
        l2FromBlock,
        l2LatestBlock
      )
    ]);

    let lastProposalTime = 0;
    let lastBatchTime = 0;

                // L1에서 L2 → L1 proposal 시간 처리 (OutputProposed 이벤트)
    if (proposalEvents.status === 'fulfilled') {
      console.log(`📊 Found ${proposalEvents.value.length} proposal events on L1`);
      if (proposalEvents.value.length > 0) {
        const latestProposal = proposalEvents.value[proposalEvents.value.length - 1];
        if ('args' in latestProposal && latestProposal.args) {
          lastProposalTime = Number(latestProposal.args[3]) * 1000; // L1 timestamp를 milliseconds로 변환
          console.log(`📊 Latest L2→L1 proposal time: ${new Date(lastProposalTime).toISOString()}`);
        }
      } else {
        console.warn('⚠️ No L2→L1 proposal events found in the search range');
      }
    } else {
      console.warn('⚠️ Failed to fetch L2→L1 proposal events:', proposalEvents.reason);
    }

    // L2에서 batch submission 시간 처리 (TransactionBatchAppended 이벤트)
    if (batchEvents.status === 'fulfilled') {
      console.log(`📊 Found ${batchEvents.value.length} batch events on L2`);
      if (batchEvents.value.length > 0) {
        const latestBatch = batchEvents.value[batchEvents.value.length - 1];
        const block = await l2Provider.getBlock(latestBatch.blockNumber);
        lastBatchTime = block?.timestamp ? block.timestamp * 1000 : 0; // L2 timestamp를 milliseconds로 변환
        console.log(`📊 Latest L2 batch submission time: ${new Date(lastBatchTime).toISOString()}`);
      } else {
        console.warn('⚠️ No L2 batch events found in the search range');
      }
    } else {
      console.warn('⚠️ Failed to fetch L2 batch events:', batchEvents.reason);
    }

    return {
      lastProposalTime,
      lastBatchTime
    };

  } catch (error) {
    console.error('❌ Error fetching contract timestamps:', error);
    return {
      lastProposalTime: 0,
      lastBatchTime: 0
    };
  }
}

// 대안: 블록 기반으로 최근 시간 추정
export async function getEstimatedTimestamps(
  l1RpcUrl: string,
  l2RpcUrl: string,
  l1ChainId: number
): Promise<ContractTimestamps> {
  try {
    console.log(`🔍 Estimating timestamps from latest blocks`);

    // RPC URL 유효성 검사
    if (!isValidRpcUrl(l1RpcUrl)) {
      console.warn(`⚠️ Invalid L1 RPC URL for timestamp estimation: ${l1RpcUrl}`);
      throw new Error(`Invalid L1 RPC URL: ${l1RpcUrl}`);
    }

    if (!isValidRpcUrl(l2RpcUrl)) {
      console.warn(`⚠️ Invalid L2 RPC URL for timestamp estimation: ${l2RpcUrl}`);
      throw new Error(`Invalid L2 RPC URL: ${l2RpcUrl}`);
    }

    const l1Provider = new ethers.JsonRpcProvider(l1RpcUrl, undefined, {
      staticNetwork: true,
      batchMaxCount: 1,
      batchStallTime: 0
    });
    const l2Provider = new ethers.JsonRpcProvider(l2RpcUrl, undefined, {
      staticNetwork: true,
      batchMaxCount: 1,
      batchStallTime: 0
    });

    // 최신 블록 가져오기
    const [l1Block, l2Block] = await Promise.all([
      l1Provider.getBlock('latest'),
      l2Provider.getBlock('latest')
    ]);

    const now = Date.now();
    const l1BlockTime = l1Block?.timestamp ? l1Block.timestamp * 1000 : now;
    const l2BlockTime = l2Block?.timestamp ? l2Block.timestamp * 1000 : now;

    // 추정: L1 블록 시간을 proposal 시간으로, L2 블록 시간을 batch 시간으로 사용
    return {
      lastProposalTime: l1BlockTime,
      lastBatchTime: l2BlockTime
    };

  } catch (error) {

    console.error('❌ Error estimating timestamps:', error);
    return {
      lastProposalTime: 0,
      lastBatchTime: 0
    };
  }
}