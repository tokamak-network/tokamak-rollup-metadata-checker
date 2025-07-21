import React from 'react';
import { AddressDisplay } from './AddressDisplay';
import { Card } from './Card';

interface ContractAddress {
  name: string;
  address: string;
  explorerUrl: string;
  copyTooltip: string;
  linkTooltip: string;
}

interface ContractSection {
  title: string;
  addresses: ContractAddress[];
}

interface ContractAddressGridProps {
  title: string;
  sections: ContractSection[];
  className?: string;
}

export function ContractAddressGrid({ title, sections, className = "" }: ContractAddressGridProps) {
  return (
    <Card
      padding="custom"
      paddingX="sm"
      paddingY="md"
      hover={true}
      className={`mt-8 ${className}`}
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              {section.title}
            </h4>
            <div className="space-y-2">
              {section.addresses.map((contract, index) => (
                <AddressDisplay
                  key={index}
                  address={contract.address}
                  label={contract.name}
                  explorerUrl={contract.explorerUrl}
                  copyTooltip={contract.copyTooltip}
                  linkTooltip={contract.linkTooltip}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}