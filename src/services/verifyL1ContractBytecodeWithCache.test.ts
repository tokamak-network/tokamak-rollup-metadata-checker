import { verifyL1ContractBytecodeWithCache } from './verifyL1ContractBytecodeWithCache';

describe('verifyL1ContractBytecodeWithCache', () => {
  it('should verify SystemConfig on sepolia', async () => {
    const address = '0xef10be662275c39BCEEA5677E4085Ab1758900e1'; // 실제 L1StandardBridge 주소로 교체 필요
    const network = 'sepolia';
    const name = 'SystemConfig';
    const rpcUrl = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';

    const result = await verifyL1ContractBytecodeWithCache({
      name,
      network,
      rpcUrl,
      address,
    });
    // console.log(result);
    expect(result).toHaveProperty('contract');
    expect(result).toHaveProperty('isProxy');
    expect(typeof result.match).toBe('boolean');
    expect(result).toHaveProperty('chainId');
    expect(result.match).toEqual(true);
  });

  it('should verify OptimismPortal on sepolia', async () => {
    const address = '0x7425d4D6B37744b2F9c100eE54Ff7eAB1ED4730A'; // 실제 L1StandardBridge 주소로 교체 필요
    const network = 'sepolia';
    const name = 'OptimismPortal';
    const rpcUrl = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';

    const result = await verifyL1ContractBytecodeWithCache({
      name,
      network,
      rpcUrl,
      address,
    });
    // console.log(result);
    expect(result).toHaveProperty('contract');
    expect(result).toHaveProperty('isProxy');
    expect(typeof result.match).toBe('boolean');
    expect(result).toHaveProperty('chainId');
    expect(result.match).toEqual(true);
  });

  it('should verify L1StandardBridge on sepolia', async () => {
    const address = '0x5832ff571ee3ff2e6b35Ce23a4Bbd30035b02217'; // 실제 L1StandardBridge 주소로 교체 필요
    const network = 'sepolia';
    const name = 'L1StandardBridge';
    const rpcUrl = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';

    const result = await verifyL1ContractBytecodeWithCache({
      name,
      network,
      rpcUrl,
      address,
    });
    // console.log(result);
    expect(result).toHaveProperty('contract');
    expect(result).toHaveProperty('isProxy');
    expect(typeof result.match).toBe('boolean');
    expect(result).toHaveProperty('chainId');
    expect(result.match).toEqual(true);
  });


  it('should verify L1CrossDomainMessenger on sepolia', async () => {
    const address = '0x9C222982A51edEC093a4Ec042755d8f98546187A'; // 실제 L1StandardBridge 주소로 교체 필요
    const network = 'sepolia';
    const name = 'L1CrossDomainMessenger';
    const rpcUrl = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';


    // L1CrossDomainMessenger 는 verifyL1ContractBytecodeWithCache 이 함수로 검증이 안되고 별도로 검증해야 한다.
    const result = await verifyL1ContractBytecodeWithCache({
      name,
      network,
      rpcUrl,
      address,
    });
    // console.log(result);
    expect(result).toHaveProperty('contract');
    expect(result).toHaveProperty('isProxy');
    expect(typeof result.match).toBe('boolean');
    expect(result).toHaveProperty('chainId');
    expect(result.match).toEqual(false);
  });



});