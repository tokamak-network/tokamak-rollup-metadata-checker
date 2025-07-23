import { verifyL2ContractBytecode } from './verifyL2ContractBytecode';

import { CONTRACT_PROXY_TYPE_MAP } from '../config/index';

describe('verifyL2ContractBytecode', () => {
  it('should compare L2StandardBridge bytecode with reference', async () => {
    const rpcUrl = 'http://k8s-opgeth-0ff8d5f51e-1101864706.ap-northeast-2.elb.amazonaws.com';
    const address = '0x4200000000000000000000000000000000000010';
    const name = 'L2StandardBridge';
    const l2ChainId = 111551204981;

    const result = await verifyL2ContractBytecode({
      name,
      address,
      rpcUrl,
      l2ChainId
    });
    // console.log(result);

    expect(typeof result.match).toBe('boolean');
    expect(result.contract).toBe(name);
    expect(typeof result.match).toBe('boolean');
    expect(result.match).toEqual(true);
  });

  it('should compare l2CrossDomainMessenger bytecode with reference', async () => {
    const rpcUrl = 'http://k8s-opgeth-0ff8d5f51e-1101864706.ap-northeast-2.elb.amazonaws.com';
    const address = '0x4200000000000000000000000000000000000007';
    const name = 'L2CrossDomainMessenger';
    const l2ChainId = 111551204981;

    const result = await verifyL2ContractBytecode({
      name,
      address,
      rpcUrl,
      l2ChainId
    });
    // console.log(result);

    expect(typeof result.match).toBe('boolean');
    expect(result.contract).toBe(name);
    expect(typeof result.match).toBe('boolean');
    expect(result.match).toEqual(true);
  });

  it('should compare gasPriceOracle bytecode with reference', async () => {
    const rpcUrl = 'http://k8s-opgeth-0ff8d5f51e-1101864706.ap-northeast-2.elb.amazonaws.com';
    const address = '0x420000000000000000000000000000000000000F';
    const name = 'GasPriceOracle';
    const l2ChainId = 111551204981;

    const result = await verifyL2ContractBytecode({
      name,
      address,
      rpcUrl,
      l2ChainId
    });
    // console.log(result);

    expect(typeof result.match).toBe('boolean');
    expect(result.contract).toBe(name);
    expect(typeof result.match).toBe('boolean');
    expect(result.match).toEqual(true);
  });

  it('should compare l1Block bytecode with reference', async () => {
    const rpcUrl = 'http://k8s-opgeth-0ff8d5f51e-1101864706.ap-northeast-2.elb.amazonaws.com';
    const address = '0x4200000000000000000000000000000000000015';
    const name = 'L1Block';
    const l2ChainId = 111551204981;

    const result = await verifyL2ContractBytecode({
      name,
      address,
      rpcUrl,
      l2ChainId
    });
    // console.log(result);

    expect(typeof result.match).toBe('boolean');
    expect(result.contract).toBe(name);
    expect(typeof result.match).toBe('boolean');
    expect(result.match).toEqual(true);
  });

  it('should compare l2ToL1MessagePasser bytecode with reference', async () => {
    const rpcUrl = 'http://k8s-opgeth-0ff8d5f51e-1101864706.ap-northeast-2.elb.amazonaws.com';
    const address = '0x4200000000000000000000000000000000000016';
    const name = 'L2ToL1MessagePasser';
    const l2ChainId = 111551204981;

    const result = await verifyL2ContractBytecode({
      name,
      address,
      rpcUrl,
      l2ChainId
    });
    // console.log(result);

    expect(typeof result.match).toBe('boolean');
    expect(result.contract).toBe(name);
    expect(typeof result.match).toBe('boolean');
    expect(result.match).toEqual(true);
  });

  it('should compare wrappedETH bytecode with reference', async () => {
    const rpcUrl = 'http://k8s-opgeth-0ff8d5f51e-1101864706.ap-northeast-2.elb.amazonaws.com';
    const address = '0x4200000000000000000000000000000000000006';
    const name = 'wrappedETH';
    const l2ChainId = 111551204981;

    const result = await verifyL2ContractBytecode({
      name,
      address,
      rpcUrl,
      l2ChainId
    });
    console.log(result);

    expect(typeof result.match).toBe('boolean');
    expect(result.contract).toBe('WETH');
    expect(typeof result.match).toBe('boolean');
    expect(result.match).toEqual(true);
  });


});