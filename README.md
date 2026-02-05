# Ledger Agent Payments

> **"Agents propose, humans sign with hardware."**

A secure bridge between AI agents and blockchain transactions. Agents draft and propose transactions, but only **you** can sign them — on your Ledger device.

[![USDC Hackathon](https://img.shields.io/badge/USDC%20Hackathon-Moltbook-blue)](https://www.moltbook.com/m/usdc)
[![Deadline](https://img.shields.io/badge/Deadline-Feb%208%2C%202026-red)](https://www.circle.com/blog/openclaw-usdc-hackathon-on-moltbook)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## The Problem

AI agents are getting powerful. They can read your emails, manage your calendar, write code, and browse the web. Soon they'll need to **spend money** on your behalf.

But agents + private keys = disaster.

One prompt injection, one compromised skill, one bad actor — and your funds are gone.

## The Solution

**Intent Queue + Ledger Hardware Signing**

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   AI Agent      │────▶│   Intent Queue   │────▶│  Ledger Signer  │
│   (OpenClaw)    │     │  (Pending txns)  │     │  (Human + HW)   │
│                 │     │                  │     │                 │
│ • Analyzes      │     │ • Stores intents │     │ • Reviews       │
│ • Drafts txns   │     │ • Shows details  │     │ • Approves/     │
│ • NO key access │     │ • Audit trail    │     │   Rejects       │
└─────────────────┘     └──────────────────┘     │ • Signs on HW   │
                                                 └─────────────────┘
```

- Agents can propose any transaction
- Humans review full details before signing
- Hardware wallet security (Ledger)
- Complete audit trail
- Sleep well at night

---

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 10+
- A Ledger device (for signing)

### Installation

```bash
# Clone the repo
git clone https://github.com/fistfulayen/ledger-agent-intents.git
cd ledger-agent-intents

# Install dependencies
pnpm install

# Build shared types
pnpm build --filter @agent-intents/shared
```

### Running Locally

```bash
# Start the backend (Terminal 1)
pnpm dev --filter @agent-intents/backend

# Start the web app (Terminal 2)
pnpm dev --filter @agent-intents/web
```

The backend runs on `http://localhost:3001` and the web app on `http://localhost:5173`.

### Test with the CLI

```bash
# Create an intent
node packages/skill/bin/ledger-intent.js send 50 USDC to 0x1234...5678 for "podcast payment"

# List pending intents
node packages/skill/bin/ledger-intent.js list

# Check intent status
node packages/skill/bin/ledger-intent.js status <intent-id>
```

---

## Architecture

```
ledger-agent-intents/
├── apps/
│   ├── backend/          # Express API (intent queue + audit)
│   └── web/              # React web app (review + sign)
├── packages/
│   ├── shared/           # TypeScript types & constants
│   └── skill/            # OpenClaw skill (ledger-intent CLI)
├── PROJECT.md            # Living project documentation
└── README.md             # You are here
```

### Components

| Component | Description |
|-----------|-------------|
| **Backend** | REST API for creating, listing, and updating intents |
| **Web App** | React UI with Ledger integration for reviewing and signing |
| **Skill** | CLI for agents to create intents (`ledger-intent send ...`) |
| **Shared** | TypeScript types for Intent, Status, supported chains & tokens |

---

## CLI Reference

The `ledger-intent` CLI allows AI agents to submit transaction intents.

### Commands

```bash
# Send tokens
ledger-intent send <amount> <token> to <address> [for "reason"] [--chain <id>] [--urgency <level>]

# Check intent status
ledger-intent status <intent-id>

# List recent intents
ledger-intent list [--status pending|signed|confirmed|rejected]
```

### Examples

```bash
# Pay someone for podcast work
ledger-intent send 50 USDC to 0x1234...5678 for "podcast intro music"

# Send ETH on mainnet
ledger-intent send 0.5 ETH to vitalik.eth

# Urgent payment on Polygon
ledger-intent send 100 USDC to 0xabc...def for "time-sensitive invoice" --chain 137 --urgency high
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `INTENT_API_URL` | Backend URL | `http://localhost:3001` |
| `INTENT_AGENT_ID` | Agent identifier | `clouseau` |
| `INTENT_AGENT_NAME` | Display name | `Inspector Clouseau` |
| `INTENT_USER_ID` | User ID for intents | `demo-user` |

---

## Agent Provisioning (LKRP)

Agents authenticate using **secp256k1 keypairs** generated via LKRP's `NobleCryptoService`. The user provisions an agent from the **Settings** page in the web app, downloads a JSON credential file, and the agent uses it to sign API requests.

### 1. Provision an Agent Key (UI)

1. Open the web app and connect your Ledger device
2. Go to **Settings > Agent Keys**
3. Click **New Agent Key**, enter a name
4. A keypair is generated client-side using LKRP crypto and the public key is registered on the backend
5. **Download the credential file** — it contains the private key and will not be shown again

The downloaded file looks like:

```json
{
  "version": 1,
  "label": "My Trading Bot",
  "trustchainId": "0xabc...def",
  "privateKey": "0x...",
  "publicKey": "0x...",
  "createdAt": "2026-02-05T12:00:00.000Z"
}
```

### 2. Create an Authenticated Intent (Agent-Side)

Once you have the credential file, your agent signs every API request with the private key using the `AgentAuth` header scheme:

```
Authorization: AgentAuth <timestamp>.<bodyHash>.<signature>
```

Here's a full Node.js example using **viem** (the LKRP private key is a standard secp256k1 key):

```typescript
import { privateKeyToAccount } from "viem/accounts";
import { keccak256, toHex } from "viem";
import fs from "fs";

// 1. Load the credential file
const credential = JSON.parse(fs.readFileSync("./agent-credential.json", "utf-8"));
const account = privateKeyToAccount(credential.privateKey);

// 2. Build the request body
const body = JSON.stringify({
  agentId: "my-trading-bot",
  agentName: "My Trading Bot",
  details: {
    type: "transfer",
    token: "USDC",
    amount: "50",
    recipient: "0x1234567890abcdef1234567890abcdef12345678",
    chainId: 8453,
    memo: "Payment for API access"
  }
});

// 3. Create the AgentAuth header
const timestamp = Math.floor(Date.now() / 1000).toString();
const bodyHash = keccak256(toHex(body));
const message = `${timestamp}.${bodyHash}`;
const signature = await account.signMessage({ message });
const authHeader = `AgentAuth ${timestamp}.${bodyHash}.${signature}`;

// 4. Send the request
const res = await fetch("https://your-app.vercel.app/api/intents", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": authHeader,
  },
  body,
});

const data = await res.json();
console.log("Intent created:", data.intent.id);
```

When using `AgentAuth`, the `userId` field is **ignored** — the backend derives the identity from the verified agent key.

### 3. Revoke an Agent Key

Go to **Settings > Agent Keys** in the web app and click **Revoke** on the agent. The agent will receive `401 Unauthorized` on subsequent requests.

---

## API Reference

### Intents

#### Create Intent

```http
POST /api/intents
Content-Type: application/json
Authorization: AgentAuth <timestamp>.<bodyHash>.<signature>

{
  "agentId": "clouseau",
  "agentName": "Inspector Clouseau",
  "details": {
    "type": "transfer",
    "token": "USDC",
    "amount": "50",
    "recipient": "0x...",
    "chainId": 8453,
    "memo": "podcast payment"
  }
}
```

The `Authorization` header is optional. Without it, the legacy demo mode is used (`userId` from body or `"demo-user"`).

#### Get Intent

```http
GET /api/intents/:id
```

#### List User Intents

```http
GET /api/users/:userId/intents?status=pending&limit=50
```

#### Update Intent Status

```http
PATCH /api/intents/:id/status
Content-Type: application/json

{
  "status": "signed",
  "txHash": "0x..."
}
```

### Agents

#### Register Agent

```http
POST /api/agents/register
Content-Type: application/json

{
  "trustChainId": "0xabc...def",
  "agentLabel": "My Trading Bot",
  "agentPublicKey": "0x..."
}
```

#### List Agents

```http
GET /api/agents?trustchainId=0xabc...def
```

#### Revoke Agent

```http
DELETE /api/agents/:id
```

---

## Supported Chains & Tokens

| Chain ID | Name | Tokens |
|----------|------|--------|
| 1 | Ethereum | ETH, USDC, USDT, DAI |
| 137 | Polygon | MATIC, USDC, USDT |
| 8453 | Base | ETH, USDC |

---

## Deployment (Vercel + Neon)

### Prerequisites

- A [Vercel](https://vercel.com) account
- A [Neon](https://neon.tech) account (or Vercel Postgres — they use Neon under the hood)
- The repo pushed to GitHub

### Step 1: Create the Neon Database

1. Go to [neon.tech](https://neon.tech) and create a new project
2. Choose a region close to your Vercel deployment (e.g., `us-east-1`)
3. Copy the connection strings from the Neon dashboard:
   - **Pooled connection** (`POSTGRES_URL`) — used by the serverless functions at runtime
   - **Direct connection** (`POSTGRES_URL_NON_POOLING`) — used for migrations

### Step 2: Run the Schema

Apply the schema to your Neon database:

```bash
# Set the direct (non-pooling) connection string
export POSTGRES_URL_NON_POOLING="postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require"

# Create all tables
psql "$POSTGRES_URL_NON_POOLING" -f apps/web/db/migrations/001_initial_schema.sql
```

### Step 3: Deploy to Vercel

1. Import the repo in the Vercel dashboard
2. Set the **Root Directory** to `apps/web`
3. Framework preset: **Vite**
4. The build commands are already configured in `vercel.json`:
   - Install: `cd ../.. && pnpm install --frozen-lockfile`
   - Build: `cd ../.. && pnpm -w turbo run build --filter=@agent-intents/web...`
   - Output: `dist`

### Step 4: Set Environment Variables in Vercel

Go to your project **Settings > Environment Variables** and add:

| Variable | Value | Required |
|----------|-------|----------|
| `POSTGRES_URL` | Neon pooled connection string | Yes |
| `POSTGRES_URL_NON_POOLING` | Neon direct connection string | Yes |
| `VITE_LEDGER_API_KEY` | Your Ledger Developer Portal API key | Yes |
| `VITE_BASE_MAINNET_RPC_URL` | Base mainnet RPC URL (e.g., Alchemy) | Optional |
| `VITE_LEDGER_STUB_DAPP_CONFIG` | `false` (or omit) | No |

> **Tip:** If you use Vercel Postgres (which is backed by Neon), the `POSTGRES_URL` and `POSTGRES_URL_NON_POOLING` variables are set automatically when you link the integration.

### Step 5: Verify

1. Visit `https://your-app.vercel.app/api/health` — should return `{ "success": true, "status": "ok" }`
2. Open the web app, connect your Ledger, and go to Settings to provision an agent key
3. Use the downloaded credential file to POST an authenticated intent (see [Agent Provisioning](#agent-provisioning-lkrp) above)

---

## Environment Variables

### Web App (`apps/web/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_LEDGER_API_KEY` | Ledger Developer Portal API key | (required) |
| `VITE_BACKEND_URL` | Backend URL for local dev | `""` (same-origin) |
| `VITE_BASE_MAINNET_RPC_URL` | Base mainnet RPC override | (optional) |
| `VITE_LEDGER_STUB_DAPP_CONFIG` | Use stub dApp config | `false` |
| `POSTGRES_URL` | Neon/Vercel Postgres pooled URL | (required for API) |
| `POSTGRES_URL_NON_POOLING` | Neon/Vercel Postgres direct URL | (required for migrations) |

---

## Development

### Scripts

```bash
# Run all apps in development mode
pnpm dev

# Build all packages
pnpm build

# Type check all packages
pnpm typecheck

# Lint and format
pnpm lint
pnpm format
```

### Tech Stack

- **Monorepo**: pnpm workspaces + Turborepo
- **Backend**: Express.js, TypeScript
- **Frontend**: React 19, TanStack Router, TanStack Query, Tailwind CSS
- **Tooling**: Biome (lint/format), Vite

---

## Roadmap

- [x] Core intent queue system
- [x] Backend API
- [x] Web app with Ledger integration
- [x] OpenClaw skill CLI
- [ ] Vercel deployment
- [ ] Real ERC-20 transfer encoding
- [ ] Multi-chain support (Polygon, Base)
- [ ] Intent expiration
- [ ] Batch signing
- [ ] Spending limits & rules

---

## Why This Wins

| Criteria | How We Deliver |
|----------|----------------|
| **Security** | Agents never touch keys. Hardware signs everything. |
| **USDC Native** | Built for stable, predictable agent commerce |
| **Practical** | Solves a real problem agents will face |
| **Ledger Showcase** | Perfect demo of hardware wallet value prop |
| **Agent-Friendly** | Other agents voting will appreciate the security model |

---

## Use Cases

### Agent-to-Agent Economy
- Agent hiring agent for research tasks
- Moltbook bounties with escrow
- Agent tip jars for valuable contributions

### Creator & Content Payments
- Podcast guest payments
- AI artist commissions
- Subscription management

### Business Operations
- Contractor invoice processing
- Expense reimbursements
- DAO payroll runs

### DeFi with Training Wheels
- Yield optimization proposals
- Dollar-cost averaging
- Limit order agents

---

## Hackathon

This project is a submission to the [USDC OpenClaw Hackathon on Moltbook](https://www.circle.com/blog/openclaw-usdc-hackathon-on-moltbook).

- **Prize Pool:** $30,000 USDC
- **Deadline:** Sunday, Feb 8, 2026 at 12:00 PM PST
- **Track:** Agentic Commerce / Best OpenClaw Skill

---

## Team

- **Ian Rogers** — [@iancr](https://x.com/iancr)
- **Inspector Clouseau** — AI Assistant (OpenClaw)
- **Ledger Team** — Contributors

---

## License

MIT

---

*"Your agent has root access. Your keys don't."*
