import { L2Status } from '@/types/metadata';

interface StatusFilterProps {
  value: string;
  onChange: (value: string) => void;
  rollups: L2Status[];
}

export function StatusFilter({ value, onChange, rollups }: StatusFilterProps) {
  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'deprecated', label: 'Deprecated' },
  ];

  const getStatusCount = (status: string) => {
    if (status === 'all') return rollups.length;
    return rollups.filter(r => r.status === status).length;
  };

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-tokamak-blue focus:border-tokamak-blue rounded-md"
      >
        {statuses.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label} ({getStatusCount(status.value)})
          </option>
        ))}
      </select>
    </div>
  );
}