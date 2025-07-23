import { NextRequest, NextResponse } from 'next/server';
import { fetchGithubDirItemsFromHtml } from '@/utils/git-crawling';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const network = searchParams.get('network') || 'sepolia';
  try {
    const fileNames = await fetchGithubDirItemsFromHtml(network);

    return NextResponse.json(fileNames);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}