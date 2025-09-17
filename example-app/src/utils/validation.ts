import { RollupMetadata, L2Status } from '../types/metadata';

export function validateMetadata(metadata: any): metadata is RollupMetadata {
  const requiredFields = [
    'name',
    'chainId',
    'l1ChainId',
    'systemConfig',
    'batchInbox',
    'batchSender',
    'l2OutputOracle',
    'optimismPortal',
    'l1StandardBridge',
    'l2StandardBridge',
    'sequencer',
    'proposer',
    'challenger',
    'deploymentBlock',
    'genesisHash',
    'genesisTimestamp',
    'withdrawalDelaySeconds',
    'l2BlockTime',
    'submissionInterval',
    'l2GenesisBlockGasLimit',
    'signature',
    'version',
    'timestamp'
  ];

  for (const field of requiredFields) {
    if (!(field in metadata)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  // Type validations
  if (typeof metadata.name !== 'string') {
    throw new Error('name must be a string');
  }

  if (typeof metadata.chainId !== 'number') {
    throw new Error('chainId must be a number');
  }

  if (typeof metadata.l1ChainId !== 'number') {
    throw new Error('l1ChainId must be a number');
  }

  if (!isValidAddress(metadata.systemConfig)) {
    throw new Error('systemConfig must be a valid Ethereum address');
  }

  if (!isValidAddress(metadata.sequencer)) {
    throw new Error('sequencer must be a valid Ethereum address');
  }

  if (!isValidAddress(metadata.proposer)) {
    throw new Error('proposer must be a valid Ethereum address');
  }

  if (!isValidAddress(metadata.challenger)) {
    throw new Error('challenger must be a valid Ethereum address');
  }

  if (!isValidHash(metadata.genesisHash)) {
    throw new Error('genesisHash must be a valid hash');
  }

  if (!metadata.signature || typeof metadata.signature !== 'object') {
    throw new Error('signature must be an object');
  }

  if (!metadata.signature.messageHash || !metadata.signature.signature || !metadata.signature.signer) {
    throw new Error('signature must contain messageHash, signature, and signer');
  }

  return true;
}

export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function isValidHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

export function isValidChainId(chainId: number): boolean {
  return Number.isInteger(chainId) && chainId > 0;
}

export function validateL2Status(status: L2Status): string[] {
  const errors: string[] = [];

  if (!status.name || typeof status.name !== 'string') {
    errors.push('Invalid or missing name');
  }

  if (!isValidChainId(status.l2ChainId)) {
    errors.push('Invalid chain ID');
  }

  if (status.latestL2Block < 0) {
    errors.push('Latest L2 block cannot be negative');
  }

  if (status.latestL1Block < 0) {
    errors.push('Latest L1 block cannot be negative');
  }

  if (status.lastProposalTime !== undefined && status.lastProposalTime < 0) {
    errors.push('Last proposal time cannot be negative');
  }

  if (status.lastBatchTime !== undefined && status.lastBatchTime < 0) {
    errors.push('Last batch time cannot be negative');
  }

  const validSequencerStatuses = ['active', 'inactive', 'unknown'];
  if (status.sequencerStatus && !validSequencerStatuses.includes(status.sequencerStatus)) {
    errors.push('Invalid sequencer status');
  }

  const validProposerStatuses = ['active', 'inactive', 'unknown'];
  if (status.proposerStatus && !validProposerStatuses.includes(status.proposerStatus)) {
    errors.push('Invalid proposer status');
  }

  const validWithdrawalStatuses = ['normal', 'delayed', 'unknown'];
  if (status.withdrawalDelayStatus && !validWithdrawalStatuses.includes(status.withdrawalDelayStatus)) {
    errors.push('Invalid withdrawal delay status');
  }

  const validSystemConfigStatuses = ['active', 'paused', 'unknown'];
  if (status.systemConfigStatus && !validSystemConfigStatuses.includes(status.systemConfigStatus)) {
    errors.push('Invalid system config status');
  }

  const validRpcStatuses = ['healthy', 'unhealthy', 'unknown'];
  if (!validRpcStatuses.includes(status.rpcStatus)) {
    errors.push('Invalid RPC status');
  }

  const validExplorerStatuses = ['healthy', 'unhealthy', 'unknown'];
  if (status.explorerStatus && !validExplorerStatuses.includes(status.explorerStatus)) {
    errors.push('Invalid explorer status');
  }

  if (!(status.lastChecked instanceof Date)) {
    errors.push('Last checked must be a Date object');
  }

  if (!Array.isArray(status.errors)) {
    errors.push('Errors must be an array');
  }

  return errors;
}

export function sanitizeUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    // HTTP/HTTPS만 허용
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      throw new Error('Invalid protocol');
    }
    return parsedUrl.toString();
  } catch (error) {
    throw new Error(`Invalid URL: ${url}`);
  }
}

export function isHealthyL2(status: L2Status): boolean {
  return status.isActive &&
         status.sequencerStatus === 'active' &&
         status.rpcStatus === 'healthy' &&
         status.errors.length === 0;
}