import { L2Status } from '@/types/metadata';

interface NetworkSelectorProps {
  value: string;
  onChange: (value: string) => void;
  rollups: L2Status[];
}

export function NetworkSelector({ value, onChange, rollups }: NetworkSelectorProps) {
  const networks = [
    { value: 'all', label: 'All Networks' },
    { value: '1', label: 'Ethereum Mainnet' },
    { value: '11155111', label: 'Sepolia Testnet' },
  ];

  const getNetworkCount = (chainId: string) => {
    if (chainId === 'all') return rollups.length;
    return rollups.filter(r => r.l1ChainId.toString() === chainId).length;
  };

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-tokamak-blue focus:border-tokamak-blue rounded-md"
      >
        {networks.map((network) => (
          <option key={network.value} value={network.value}>
            {network.label} ({getNetworkCount(network.value)})
          </option>
        ))}
      </select>
    </div>
  );
}