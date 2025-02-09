# Quick Start

To get started with the agent runtime, follow these steps:

create a `.env` file in the directory `agent.node_runtime` with the following variables:

```bash
AI_PRIVATE_KEY=
SEPOLIA_RPC_URL=
TARVENCOIN_ADDRESS=
TARVENNFT_ADDRESS=
```

To see how to get these contract addresses, please refer to the `smart_contract` git branch.

Then, run the following commands to install dependencies and start the agent runtime:

```bash
pnpm install && pnpm run dev
```