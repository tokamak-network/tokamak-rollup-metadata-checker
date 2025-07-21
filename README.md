# Tokamak Rollup Metadata Checker


## Overview

This project verifies that deployed L1 contracts (including proxies and their implementations) match the official bytecode published by Tokamak Network. It supports various proxy patterns (Proxy, L1ChugSplashProxy, ResolvedDelegateProxy, L1UsdcBridgeProxy, etc.) and extracts implementation/admin addresses according to proxy type.

On the main screen, you can select an L2 from a list and check its metadata (rollup info, SystemConfig, L2OutputOracle, OptimismPortal, etc.) and real-time status. The system also verifies that L1/L2 contracts associated with the L2 (including proxies/implementations) match the official Tokamak deployment bytecode.

The UI displays the following L2 metadata and status fields at a glance:
- L2 name, description, logo, network, chain ID
- L2/L1 block height, block time, gas limit, last proposal/batch time
- Service status for RPC, block explorer, bridge, staking, etc.
- Key L1/L2 contract addresses (with copy/explorer links)
- Staking candidate/operator/manager info, memo, registration transaction, etc.
- Contract verification (whether deployed bytecode matches official release)

## ✨ Features

- **L2 metadata and status check**: Select an L2 on the main screen to view its metadata and real-time status (block, sequencer, contract, etc.)
  - Example: L2 name, description, network, chain ID, block height, block time, gas limit, proposal/batch time, service (RPC/explorer/bridge/staking) status, contract addresses, staking info, etc.
- **L1/L2 contract official deployment verification**: Checks that L1/L2 contracts (including proxies/implementations) associated with the L2 match the official Tokamak bytecode
- **Proxy type awareness**: Extracts implementation/admin addresses and compares bytecode according to proxy structure
- **API endpoint**: Next.js-based L1 contract verification API
- **UI component**: React component to display verification results
- **Tests**: Jest tests covering both success and failure cases
- **RPC rate limit handling**: Adds delays between RPC calls

## 📁 Project Structure

```
public/
  bytecodes/                # Official proxy bytecode JSONs (Proxy.json, L1ChugSplashProxy.json, etc)
src/
  app/
    api/
      l1-contract-verification/route.ts  # L1 contract verification API
  components/
    ui/ContractVerificationCard.tsx      # Verification result UI
  utils/
    abi.ts                # Verification logic
    abi.test.ts           # Jest tests
    official-deployment.ts# Fetches official bytecode
```

## ⚡ Usage

### 1. Install dependencies
```bash
npm install
```

### 2. Prepare official bytecode files
- Place official proxy bytecode JSONs (e.g., Proxy.json, L1ChugSplashProxy.json, etc.) in the `public/bytecodes/` folder.
- Each file must contain at least a `bytecode` field.

### 3. Run tests
```bash
npm test
```

### 4. Start the Next.js app
```bash
npm run dev
```

### 5. API usage example
- POST to `/api/l1-contract-verification` with contract info to compare deployed and official bytecode.

#### Example request
```json
{
  "name": "SystemConfig",
  "address": "0x...",
  "network": "sepolia"
}
```

## 📝 Notes
- Only L1 contract verification is supported (L2 monitoring/CLI is not included)
- Proxy/implementation bytecode comparison is proxy-type aware
- All official proxy bytecodes must be present in `public/bytecodes/`


## License
MIT