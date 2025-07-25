import { NextRequest, NextResponse } from 'next/server';
import { verifyL1ContractBytecodeWithCache } from '@/services/verifyL1ContractBytecodeWithCache';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const contracts = Array.isArray(body.contracts) ? body.contracts : [body];
    console.log('contracts', contracts);
    const results = [];
    for (const c of contracts) {
      const network = c.chainId === 1 ? 'mainnet' : 'sepolia';
      const rpcUrl = c.chainId === 1
        ? process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL || 'https://eth.llamarpc.com'
        : process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';
      try {
        const result = await verifyL1ContractBytecodeWithCache({
          name: c.name,
          network,
          rpcUrl,
          address: c.address,
          proxyAdminAddress: c.proxyAdminAddress
        });
        results.push(result);
      } catch (err) {
        results.push({ contractName: c.name, error: err instanceof Error ? err.message : String(err) });
      }
    }
    console.log('results', results);
    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}