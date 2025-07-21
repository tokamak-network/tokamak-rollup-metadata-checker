import React from 'react';
import { Card } from './Card';

interface ProxyInfo {
  address: string;
  isProxy: boolean;
  implementationAddress?: string;
  officialBytecode?: string;
  actualBytecode?: string;
  match: boolean | null;
}

interface ImplementationInfo {
  address: string;
  officialBytecode?: string;
  actualBytecode?: string;
  match: boolean | null;
}

interface ProxyAndImplVerificationResult {
  contractName: string;
  contractType: 'proxy' | 'implementation' | 'unknown';
  proxy: ProxyInfo;
  implementation: ImplementationInfo;
  error?: string;
}

interface ContractVerificationCardProps {
  results: ProxyAndImplVerificationResult[];
  loading?: boolean;
  onRefresh?: () => void;
}

function hashOrNone(bytecode?: string) {
  if (!bytecode || bytecode === '0x') return '-';
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { ethers } = require('ethers');
    return ethers.keccak256(bytecode);
  } catch {
    return '-';
  }
}

export function ContractVerificationCard({ results, loading, onRefresh }: ContractVerificationCardProps) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Contract Verification
        </h3>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center space-x-2 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh verification"
          >
            <span className={loading ? 'animate-spin' : ''}>🔄</span>
            <span>{loading ? 'Verifying...' : 'Refresh'}</span>
          </button>
        )}
      </div>
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin text-2xl mb-2">🔄</div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Verifying contracts...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">No contracts to verify</p>
        </div>
      ) : (
        <div className="space-y-6">
          {results.map((result, idx) => (
            <div key={result.contractName + idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="mb-2 text-base font-semibold text-gray-900 dark:text-white">{result.contractName}</div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-500 dark:text-gray-400">
                    <th className="text-left">Type</th>
                    <th className="text-left">Address</th>
                    <th className="text-left">Bytecode Hash</th>
                    <th className="text-center">Match</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-1 font-medium">
                      {result.contractType === 'proxy' ? 'Proxy' : 'Contract'}
                    </td>
                    <td className="py-1">{result.proxy?.address || '-'}</td>
                    <td className="py-1 font-mono">
                      {result.proxy?.isProxy ? hashOrNone(result.proxy?.actualBytecode) : '-'}
                    </td>
                    <td className="py-1 text-center">
                      {result.proxy?.match === true ? '✅' : result.proxy?.match === false ? '❌' : '-'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 font-medium">Implementation</td>
                    <td className="py-1">{result.implementation?.address || '-'}</td>
                    <td className="py-1 font-mono">{hashOrNone(result.implementation?.actualBytecode)}</td>
                    <td className="py-1 text-center">
                      {result.implementation?.match === true ? '✅' : result.implementation?.match === false ? '❌' : '-'}
                    </td>
                  </tr>
                </tbody>
              </table>
              {result.error && (
                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-700 dark:text-red-400">
                  <strong>Error:</strong> {result.error}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}