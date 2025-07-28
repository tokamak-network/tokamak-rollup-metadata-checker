# Tokamak Rollup Metadata Checker

## Overview

This project is a tool to verify the validity of L2 rollup information registered in [the Tokamak Rollup Metadata Repository](https://github.com/tokamak-network/tokamak-rollup-metadata-repository/tree/main/data). It allows users to check not only the L1/L2 information of the rollup they want to inspect, but also verifies whether the L1/L2 contracts are identical to the official deployment version.

The UI displays the following L2 metadata and status information at a glance:
- L2 name, description, logo, network, chain ID
- L2/L1 block height, block time interval (average seconds between consecutive blocks), gas limit, last proposal/batch time
- Service status for RPC, block explorer, bridge, staking, etc.
- Key L1/L2 contract addresses (with copy/explorer links)
- Staking candidate/operator/manager info, memo, registration transaction, etc.
- Contract verification (whether deployed bytecode matches official release)

## ✨ Features

- **L2 metadata and status check**: On the main screen, select an L2 to view its metadata and real-time status (block, sequencer, contract, etc.)
  - Example: L2 name, description, network, chain ID, block height, block time interval, gas limit, proposal/batch time, service (RPC/explorer/bridge/staking) status, contract addresses, staking info, etc.
- **L1/L2 contract official deployment verification**: Verifies that L1/L2 contracts (including proxies/implementations) associated with the L2 match the official Tokamak deployment bytecode
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
- For Korean instructions, see `README_KR.md`

## License
MIT