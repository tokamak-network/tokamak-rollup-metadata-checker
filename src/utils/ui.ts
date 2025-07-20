/**
 * UI utility functions for common styling and formatting
 */

/**
 * Get status color classes for different status types
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
    case 'healthy':
      return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
    case 'inactive':
    case 'unhealthy':
      return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
    case 'maintenance':
    case 'candidate':
      return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
    case 'deprecated':
      return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400';
    case 'shutdown':
    case 'unknown':
      return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
  }
}

/**
 * Get status indicator emoji for different status types
 */
export function getStatusIndicator(status: string): string {
  if (status === 'active' || status === 'healthy') {
    return '🟢';
  } else if (status === 'maintenance' || status === 'candidate') {
    return '🟡';
  } else {
    return '🔴';
  }
}

/**
 * Format timestamp to readable string
 */
export function formatTimestamp(timestamp: number): string {
  if (timestamp === 0) {
    return 'Never';
  }

  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return 'Just now';
  } else if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
}

/**
 * Truncate address to show first 6 and last 4 characters
 */
export function truncateAddress(address: string): string {
  if (!address || address.length < 10) {
    return address;
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format number with appropriate suffix (K, M, B)
 */
export function formatNumber(num: number): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}