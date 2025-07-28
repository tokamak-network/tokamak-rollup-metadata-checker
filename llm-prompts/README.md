# Tokamak Rollup LLM Prompts & Guide

This document summarizes the five key categories of information that people want to know from Tokamak rollup metadata, along with example questions. Each section links to a detailed prompt file.

---

## 1. Show me the basic information about this chain. [[prompt-basic-info](./prompts/basic-info.md)]
- Rollup name, description, official website, logo
- Network type (Optimistic, ZK, Sovereign)
- Stack information
- L1/L2 chain IDs, RPC/WS endpoints
- Native token info (symbol, name, decimals, address, logo, etc.)
- Status info
- Sequencer address
- Contract addresses
- Network configuration
- Last updated time
- Explorer and bridge URLs
- Staking information
- Network configuration

---

## 2. Show me the operational status of this chain. [[prompt-operational-status](./prompts/operational-status.md)]
- Current operational status (Active/Inactive/Maintenance, etc.)
- Block time interval (average seconds between consecutive blocks), gas limit, actual block/gas status
- Explorer/bridge operational status

---

## 3. Show me the rollup trust status of this chain. [[prompt-trust-status](./prompts/trust-status.md)]
- Consistency between SystemConfig contract addresses and metadata addresses
- Latest batch time, latest rollup time
- Compare TON balance on chain vs. bridge
- Whether rollup interval, block time interval, etc. match the configured values

---

## 4. Show me the contract verification status of this chain. [[prompt-contract-verification](./prompts/contract-verification.md)]
- Actual deployment and validity of L1/L2 contracts (bytecode matches official release)
- Whether ProxyAdmin matches the official guide

---

## 5. Show me the sequencer and DAO (Candidate) contract information of this chain. [[prompt-sequencer-dao-info](./prompts/sequencer-dao-info.md)]
- Sequencer address, batcher/proposer/aggregator, staking candidate registration info
- Whether the current sequencer address matches the on-chain sequencer

---

With these five categories, an LLM can answer any question about Tokamak rollup metadata.