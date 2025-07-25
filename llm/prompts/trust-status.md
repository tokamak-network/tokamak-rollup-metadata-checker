# Prompt: Show me the rollup trust status of this chain

## What to display (from metadata)
- SystemConfig contract address and metadata address

## What to check/process
- Consistency between SystemConfig and metadata addresses
- Latest batch/rollup time (on-chain)
- Compare TON balance on chain vs. bridge
- Whether rollup interval, block time, etc. match the configured values

## Example LLM questions
- “Is the metadata signature valid and up-to-date?”
- “Does the on-chain SystemConfig match the metadata?”