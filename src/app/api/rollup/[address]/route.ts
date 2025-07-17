import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/config';
import { RollupMetadata, L2Status } from '@/types/metadata';

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

    console.log(`🔍 Fetching details for L2 with address: ${address}`);

    // Get file list from jsDelivr API
    const apiResponse = await fetch(`${config.jsDelivrApiUrl}?limit=1000`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!apiResponse.ok) {
      throw new Error(`Failed to fetch file list from jsDelivr: ${apiResponse.status}`);
    }

    const fileList = await apiResponse.json();
    console.log(`📁 Found ${fileList.files?.length || 0} files in repository`);

        // Filter JSON metadata files
    const jsonFiles = fileList.files?.filter((file: any) => {
      const filename = file.name;
      return filename.endsWith('.json') &&
             filename !== 'README.md' &&
             !filename.includes('template');
    }) || [];

    console.log(`📄 Found ${jsonFiles.length} metadata files to check`);

    // Search through each metadata file to find matching systemConfig address
    let metadata: RollupMetadata | null = null;
    const targetAddress = address.toLowerCase();

    for (const file of jsonFiles) {
      try {
        const metadataUrl = `${config.metadataRepoUrl}/${file.name}`;
        const metadataResponse = await fetch(metadataUrl);

        if (!metadataResponse.ok) {
          console.warn(`⚠️ Failed to fetch ${file.name}: ${metadataResponse.status}`);
          continue;
        }

        const fileMetadata: RollupMetadata = await metadataResponse.json();

        // Check if systemConfig address matches (case-insensitive)
        if (fileMetadata.l1Contracts?.systemConfig?.toLowerCase() === targetAddress) {
          console.log(`✅ Found matching metadata in file: ${file.name}`);
          metadata = fileMetadata;
          break;
        }
      } catch (error) {
        console.warn(`⚠️ Error parsing ${file.name}:`, error);
        continue;
      }
    }

    if (!metadata) {
      return NextResponse.json(
        { error: 'L2 rollup not found' },
        { status: 404 }
      );
    }
    console.log(`✅ Successfully loaded metadata for ${metadata.name}`);

    // Simulate health checks (similar to the main rollups API)
    const rollupStatus: L2Status = {
      l1ChainId: metadata.l1ChainId,
      l2ChainId: metadata.l2ChainId,
      name: metadata.name,
      systemConfigAddress: metadata.l1Contracts.systemConfig,
      rollupType: metadata.rollupType,
      status: metadata.status,
      isActive: metadata.status === 'active',
      latestL2Block: Math.floor(Math.random() * 1000000) + 5000000,
      latestL1Block: Math.floor(Math.random() * 100000) + 18000000,
      lastProposalTime: Date.now() - Math.floor(Math.random() * 3600000),
      lastBatchTime: Date.now() - Math.floor(Math.random() * 300000),
      sequencerStatus: metadata.status === 'active' ? 'active' : 'inactive',
      proposerStatus: metadata.status === 'active' ? 'active' : 'inactive',
      withdrawalDelayStatus: 'normal',
      systemConfigStatus: metadata.status === 'active' ? 'active' : 'paused',
      rpcStatus: Math.random() > 0.1 ? 'healthy' : 'unhealthy',
      explorerStatus: Math.random() > 0.1 ? 'healthy' : 'unhealthy',
      bridgeStatus: Math.random() > 0.1 ? 'healthy' : 'unhealthy',
      stakingStatus: metadata.staking.isCandidate ? 'candidate' : 'not_candidate',
      lastChecked: new Date(),
      errors: []
    };

    return NextResponse.json({
      metadata,
      status: rollupStatus
    });

  } catch (error) {
    console.error('❌ Error fetching rollup details:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}