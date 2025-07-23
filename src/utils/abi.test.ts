import { verifyProxyAndImplementation } from './abi';

describe('verifyProxyAndImplementation', () => {
//   it('should verify SystemConfig contract on mainnet', async () => {
//     // 실제 RPC와 GitHub fetch를 사용하므로 네트워크 환경 필요
//     const rpcUrl = process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL || 'https://eth.llamarpc.com';
//     const result = await verifyProxyAndImplementation('SystemConfig', 'mainnet', rpcUrl);

//     expect(result.contractName).toBe('SystemConfig');
//     expect(result.proxy).toBeDefined();
//     expect(result.implementation).toBeDefined();
//     // 실제 match 여부는 네트워크 상황에 따라 다를 수 있음
//     expect(typeof result.proxy.match).toBe('boolean');
//     // implementation은 프록시가 아닐 경우 null일 수 있음
//   }, 15000); // 타임아웃 15초로 증가

    // it('should verify SystemConfig proxy contract on sepolia', async () => {
    //     // Sepolia 환경에서 테스트 - SystemConfig는 Proxy 타입
    //     const rpcUrl = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';
    //     const contractAddress = '0xbCa49844a2982C5E87CB3F813A4F4E94e46D44F9'; // 제공받은 주소

    //     const result = await verifyProxyAndImplementation('SystemConfig', 'sepolia', rpcUrl, contractAddress);
    //     // console.log('Contract name:', result.contractName);
    //     // console.log('Address:', result.address);
    //     // console.log('Is proxy:', result.isProxy);
    //     // console.log('Implementation address:', result.implementationAddress);
    //     // console.log('Implementation match:', result.implementationMatch);

    //     expect(result.contractName).toBe('SystemConfig');
    //     expect(result.address).toBe(contractAddress);
    //     expect(result.isProxy).toBe(true);
    //     expect(result.proxyMatch).toBe(true);
    //     expect(result.implementationAddress).toBeDefined();
    //     expect(result.adminAddress).toBeDefined();
    //     // implementation match는 boolean 또는 null일 수 있음
    //     expect(typeof result.implementationMatch === 'boolean' || result.implementationMatch === null).toBe(true);
    // }, 15000); // 타임아웃 15초로 증가

    it('should verify L1StandardBridge proxy contract on sepolia', async () => {
        // Sepolia 환경에서 테스트 - L1StandardBridge는 L1ChugSplashProxy 타입
        const rpcUrl = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';
        const contractAddress = '0xef10be662275c39bceea5677e4085ab1758900e1'; // 제공받은 주소

        const result = await verifyProxyAndImplementation('L1StandardBridge', 'sepolia', rpcUrl, contractAddress);
         console.log('Contract name:', result.contractName);
        console.log('Address:', result.address);
        console.log('Is proxy:', result.isProxy);
        console.log('Implementation address:', result.implementationAddress);
        console.log('Implementation match:', result.implementationMatch);

        expect(result.contractName).toBe('L1StandardBridge');
        expect(result.address).toBe(contractAddress);
        expect(result.isProxy).toBe(true);
        expect(result.proxyMatch).toBe(true);
        expect(result.implementationAddress).toBeDefined();
        expect(result.adminAddress).toBeDefined();
        // implementation match는 boolean 또는 null일 수 있음
        expect(typeof result.implementationMatch === 'boolean' || result.implementationMatch === null).toBe(true);
    }, 15000); // 타임아웃 15초로 증가


//     it('should throw error for L1CrossDomainMessenger (not supported yet)', async () => {
//     // L1CrossDomainMessenger는 아직 지원하지 않음
//     const rpcUrl = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';
//     const contractAddress = '0x2D7465e9a9f8b05dfF6622828aC572eB76D473DF'; // 제공받은 주소

//     await expect(
//       verifyProxyAndImplementation('L1CrossDomainMessenger', 'sepolia', rpcUrl, contractAddress)
//     ).rejects.toThrow('L1CrossDomainMessenger is not supported yet. Please use a different contract.');
//   }, 15000); // 타임아웃 15초로 증가

//

//   it('should verify ResolvedDelegateProxy contract (no admin)', async () => {
//     // ResolvedDelegateProxy는 어드민을 제공하지 않음을 테스트
//     const rpcUrl = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';
//     const contractAddress = '0x2D7465e9a9f8b05dfF6622828aC572eB76D473DF'; // 제공받은 주소

//     // 이 주소가 실제로 프록시가 아니라면 다른 테스트용 주소 사용
//     try {
//       const result = await verifyProxyAndImplementation('L1CrossDomainMessenger', 'sepolia', rpcUrl, contractAddress);

//       expect(result.contractName).toBe('L1CrossDomainMessenger');
//       expect(result.contractType).toBe('proxy');
//       expect(result.expectedProxyType).toBe('ResolvedDelegateProxy');
//       expect(result.proxy).toBeDefined();
//       expect(result.implementation).toBeDefined();
//       expect(result.proxy.address).toBe(contractAddress);
//       expect(result.proxy.isProxy).toBe(true);
//       expect(result.proxy.implementationAddress).toBeDefined();
//       expect(result.proxy.adminAddress).toBeNull(); // ResolvedDelegateProxy는 어드민이 없음
//       // proxy match는 boolean 또는 null일 수 있음
//       expect(typeof result.proxy.match === 'boolean' || result.proxy.match === null).toBe(true);
//       // implementation match는 boolean 또는 null일 수 있음
//       expect(typeof result.implementation.match === 'boolean' || result.implementation.match === null).toBe(true);
//     } catch (error) {
//       // 프록시가 아닌 경우 에러가 발생하는 것이 정상
//       expect((error as Error).message).toContain('is not a proxy contract');
//     }
//   }, 15000); // 타임아웃 15초로 증가

//   it('should handle non-existent contract gracefully', async () => {
//     const rpcUrl = process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL || 'https://eth.llamarpc.com';
//     await expect(
//       verifyProxyAndImplementation('NonExistentContract', 'mainnet', rpcUrl, '0x1234567890123456789012345678901234567890')
//     ).rejects.toThrow();
//   }, 10000); // 타임아웃 10초로 증가

//   it('should handle unknown contract in proxy type map', async () => {
//     const rpcUrl = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';
//     await expect(
//       verifyProxyAndImplementation('UnknownContract', 'sepolia', rpcUrl, '0x1234567890123456789012345678901234567890')
//     ).rejects.toThrow('Unknown contract: UnknownContract. Please add it to CONTRACT_PROXY_TYPE_MAP.');
//   }, 10000);

//   it('should handle non-proxy contract address', async () => {
//     const rpcUrl = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';
//     // 일반 EOA 주소 사용 (프록시가 아닌 주소)
//     const nonProxyAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';

//     await expect(
//       verifyProxyAndImplementation('SystemConfig', 'sepolia', rpcUrl, nonProxyAddress)
//     ).rejects.toThrow('is not a proxy contract');
//   }, 10000);

//   it('should handle proxy contract without implementation', async () => {
//     const rpcUrl = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';
//     // 구현체가 없는 프록시 주소 (예시)
//     const proxyWithoutImplAddress = '0x0000000000000000000000000000000000000000';

//     await expect(
//       verifyProxyAndImplementation('SystemConfig', 'sepolia', rpcUrl, proxyWithoutImplAddress)
//     ).rejects.toThrow('has no implementation address');
//   }, 10000);

//   it('should handle invalid RPC URL', async () => {
//     const invalidRpcUrl = 'https://invalid-rpc-url.com';

//     await expect(
//       verifyProxyAndImplementation('SystemConfig', 'sepolia', invalidRpcUrl, '0xbCa49844a2982C5E87CB3F813A4F4E94e46D44F9')
//     ).rejects.toThrow();
//   }, 15000);

//   it('should handle network timeout gracefully', async () => {
//     const slowRpcUrl = 'https://very-slow-rpc.example.com';

//     await expect(
//       verifyProxyAndImplementation('SystemConfig', 'sepolia', slowRpcUrl, '0xbCa49844a2982C5E87CB3F813A4F4E94e46D44F9')
//     ).rejects.toThrow();
//   }, 5000); // 짧은 타임아웃으로 빠른 실패 테스트
// });

// describe('compareDeployedWithOfficial', () => {
//   it('should compare deployed contract with official bytecode', async () => {
//     const rpcUrl = process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL || 'https://eth.llamarpc.com';

//     // 실제 배포된 주소 (예시)
//     const deployedProxyAddress = '0x229047fed2591dbec1eF1118d64F7aF3dB9EB290'; // SystemConfig on mainnet
//     const deployedImplAddress = '0x9BA6e03D8B90dE867373Db8cF1A58d2F7F006b3A'; // Implementation on mainnet

//     // 공식 바이트코드 (예시 - 실제로는 공식 JSON에서 가져와야 함)
//     const officialProxyBytecode = '0x608060405234801561001057600080fd5b506040516101e83803806101e88339818101604052602081101561003357600080fd5b810190808051906020019092919050505080600081905550506101918061005c6000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80632e64cec11461003b5780636057361d14610059575b600080fd5b610043610075565b6040518082815260200191505060405180910390f35b6100736004803603602081101561006f57600080fd5b810190808035906020019092919050505061007e565b005b60008054905090565b806000819055505056fea265627a7a72315820f06085b229f27f9ad48b2ff3dd9714350c1698a37853a30136fa6c5a7762af7364736f6c63430005100032';
//     const officialImplBytecode = '0x608060405234801561001057600080fd5b506040516101e83803806101e88339818101604052602081101561003357600080fd5b810190808051906020019092919050505080600081905550506101918061005c6000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80632e64cec11461003b5780636057361d14610059575b600080fd5b610043610075565b6040518082815260200191505060405180910390f35b6100736004803603602081101561006f57600080fd5b810190808035906020019092919050505061007e565b005b60008054905090565b806000819055505056fea265627a7a72315820f06085b229f27f9ad48b2ff3dd9714350c1698a37853a30136fa6c5a7762af7364736f6c63430005100032';

//     const result = await compareDeployedWithOfficial({
//       deployedProxyAddress,
//       deployedImplAddress,
//       officialProxyBytecode,
//       officialImplBytecode,
//       rpcUrl,
//     });

//     expect(result.proxy).toBeDefined();
//     expect(result.implementation).toBeDefined();
//     expect(result.proxy.address).toBe(deployedProxyAddress);
//     expect(result.implementation.address).toBe(deployedImplAddress);
//     expect(typeof result.proxy.match).toBe('boolean');
//     expect(typeof result.implementation.match).toBe('boolean');
//     expect(result.proxy.hash).toBeDefined();
//     expect(result.implementation.hash).toBeDefined();
//   }, 20000); // 타임아웃 20초

//   it('should handle missing addresses gracefully', async () => {
//     const rpcUrl = process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL || 'https://eth.llamarpc.com';

//     const result = await compareDeployedWithOfficial({
//       deployedProxyAddress: undefined,
//       deployedImplAddress: undefined,
//       officialProxyBytecode: '0x1234',
//       officialImplBytecode: '0x5678',
//       rpcUrl,
//     });

//     expect(result.proxy.match).toBeNull();
//     expect(result.implementation.match).toBeNull();
//     expect(result.proxy.address).toBeUndefined();
//     expect(result.implementation.address).toBeUndefined();
//   }, 5000);
});