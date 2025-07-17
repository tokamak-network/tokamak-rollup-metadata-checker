import { L2Status } from '../types/metadata';

export function formatAsJson(data: L2Status[]): string {
  return JSON.stringify(data, null, 2);
}

export function formatAsTable(data: L2Status[]): string {
  if (data.length === 0) {
    return 'No L2 rollups found.';
  }

  const headers = ['Name', 'Chain ID', 'Status', 'L2 Block', 'L1 Block', 'Sequencer', 'RPC', 'Last Checked'];
  const rows = data.map(status => [
    status.name,
    status.chainId.toString(),
    status.isActive ? '✅ Active' : '❌ Inactive',
    status.latestL2Block.toString(),
    status.latestL1Block.toString(),
    getStatusIcon(status.sequencerStatus),
    getStatusIcon(status.rpcStatus),
    status.lastChecked.toISOString()
  ]);

  return formatTable(headers, rows);
}

export function formatAsCsv(data: L2Status[]): string {
  if (data.length === 0) {
    return 'name,chainId,isActive,latestL2Block,latestL1Block,sequencerStatus,proposerStatus,rpcStatus,lastChecked,errors\n';
  }

  const headers = 'name,chainId,isActive,latestL2Block,latestL1Block,sequencerStatus,proposerStatus,rpcStatus,lastChecked,errors\n';
  const rows = data.map(status => [
    status.name,
    status.chainId.toString(),
    status.isActive.toString(),
    status.latestL2Block.toString(),
    status.latestL1Block.toString(),
    status.sequencerStatus,
    status.proposerStatus,
    status.rpcStatus,
    status.lastChecked.toISOString(),
    `"${status.errors.join('; ')}"`
  ].join(',')).join('\n');

  return headers + rows;
}

function getStatusIcon(status: string): string {
  switch (status) {
    case 'active':
    case 'healthy':
    case 'normal':
      return '✅';
    case 'inactive':
    case 'unhealthy':
    case 'delayed':
      return '❌';
    case 'paused':
      return '⏸️';
    default:
      return '❓';
  }
}

function formatTable(headers: string[], rows: string[][]): string {
  const columnWidths = headers.map((header, index) => {
    const maxRowWidth = Math.max(...rows.map(row => row[index]?.length || 0));
    return Math.max(header.length, maxRowWidth);
  });

  const headerRow = headers.map((header, index) =>
    header.padEnd(columnWidths[index])
  ).join(' | ');

  const separator = columnWidths.map(width => '-'.repeat(width)).join('-|-');

  const dataRows = rows.map(row =>
    row.map((cell, index) =>
      (cell || '').padEnd(columnWidths[index])
    ).join(' | ')
  );

  return [headerRow, separator, ...dataRows].join('\n');
}

export function formatSummary(data: L2Status[]): string {
  const total = data.length;
  const active = data.filter(status => status.isActive).length;
  const inactive = total - active;
  const healthyRpc = data.filter(status => status.rpcStatus === 'healthy').length;
  const errors = data.filter(status => status.errors.length > 0).length;

  return `
📊 L2 Rollup Status Summary
==========================
Total L2s: ${total}
Active: ${active} (${((active / total) * 100).toFixed(1)}%)
Inactive: ${inactive} (${((inactive / total) * 100).toFixed(1)}%)
Healthy RPC: ${healthyRpc} (${((healthyRpc / total) * 100).toFixed(1)}%)
With Errors: ${errors} (${((errors / total) * 100).toFixed(1)}%)
`;
}

export function formatErrors(data: L2Status[]): string {
  const errorsData = data.filter(status => status.errors.length > 0);

  if (errorsData.length === 0) {
    return '✅ No errors found across all L2s.';
  }

  let output = `❌ Found ${errorsData.length} L2(s) with errors:\n\n`;

  errorsData.forEach(status => {
    output += `${status.name} (Chain ID: ${status.chainId}):\n`;
    status.errors.forEach(error => {
      output += `  - ${error}\n`;
    });
    output += '\n';
  });

  return output;
}