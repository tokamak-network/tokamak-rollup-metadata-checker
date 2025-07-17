import { NextResponse } from 'next/server';
import { MetadataFetcher } from '@/services/metadata-fetcher';
import { L2BasicInfo } from '@/types/metadata';
import { config } from '@/config';

export async function GET() {
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

    const l2BasicInfoList: L2BasicInfo[] = [];

    for (const network of networks) {
      try {
        const metadata = await fetcher.fetchAllMetadata(network);

        // 메타데이터를 L2BasicInfo로 변환
        const basicInfos = metadata.map(meta => ({
          name: meta.name,
          systemConfigAddress: meta.l1Contracts.systemConfig,
          l1ChainId: meta.l1ChainId,
          l2ChainId: meta.l2ChainId,
          rollupType: meta.rollupType,
          status: meta.status,
          network: network,
          isCandidate: meta.staking.isCandidate,
        }));

        l2BasicInfoList.push(...basicInfos);
      } catch (error) {
        console.error(`Failed to fetch metadata for network ${network}:`, error);
      }
    }

    return NextResponse.json(l2BasicInfoList);
  } catch (error) {
    console.error('Error fetching L2 list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch L2 list' },
      { status: 500 }
    );
  }
}