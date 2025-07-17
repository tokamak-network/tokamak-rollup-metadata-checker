import { useState, useEffect } from 'react';

export function useSelectedL2s() {
  const [selectedL2s, setSelectedL2s] = useState<string[]>([]);

  useEffect(() => {
    // 로컬스토리지에서 선택된 L2들 로드
    const saved = localStorage.getItem('selectedL2s');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          console.log('📂 Loaded selectedL2s from localStorage:', parsed);
          setSelectedL2s(parsed);
        }
      } catch (error) {
        console.error('Failed to parse saved L2s:', error);
      }
    }
  }, []);

  const updateSelection = (selected: string[]) => {
    console.log('🔄 Updating L2 selection:', selected);
    setSelectedL2s(selected);
    localStorage.setItem('selectedL2s', JSON.stringify(selected));
  };

  const toggleL2 = (address: string) => {
    const newSelection = selectedL2s.includes(address)
      ? selectedL2s.filter(addr => addr !== address)
      : [...selectedL2s, address];
    console.log('🔀 Toggling L2:', address, 'New selection:', newSelection);
    updateSelection(newSelection);
  };

  const clearAll = () => {
    console.log('🗑️ Clearing all L2 selections');
    updateSelection([]);
  };

  const selectAll = (addresses: string[]) => {
    console.log('✅ Selecting all L2s:', addresses);
    updateSelection(addresses);
  };

  return {
    selectedL2s,
    updateSelection,
    toggleL2,
    clearAll,
    selectAll,
  };
}