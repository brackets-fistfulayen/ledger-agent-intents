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

## API Reference

### Create Intent

```http
POST /api/intents
Content-Type: application/json

{
  "agentId": "clouseau",
  "agentName": "Inspector Clouseau",
  "userId": "ian",
  "details": {
    "type": "transfer",
    "token": "USDC",
    "amount": "50",
    "recipient": "0x...",
    "chainId": 1,
    "memo": "podcast payment",
    
    // x402-aligned fields (optional)
    "resource": "https://api.example.com/service",
    "merchant": {
      "name": "Example Service",
      "url": "https://example.com",
      "logo": "https://example.com/logo.png",
      "verified": true
    },
    "category": "api_payment"
  }
}
```

#### TransferIntent Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | ✅ | Always `"transfer"` |
| `token` | string | ✅ | Token symbol (e.g., `"USDC"`, `"ETH"`) |
| `tokenAddress` | string | | ERC-20 contract address |
| `amount` | string | ✅ | Human-readable amount |
| `amountWei` | string | | Wei amount for precision |
| `recipient` | string | ✅ | Destination address |
| `recipientEns` | string | | ENS name if resolved |
| `chainId` | number | ✅ | Chain ID (e.g., `84532` for Base Sepolia) |
| `memo` | string | | Human-readable reason |
| `resource` | string | | x402 resource URL (API endpoint) |
| `merchant` | object | | Merchant/payee info (see below) |
| `category` | string | | Payment category |

#### Merchant Object

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Display name (e.g., `"OpenAI"`) |
| `url` | string | Website or service URL |
| `logo` | string | Logo URL for UI display |
| `verified` | boolean | `true` if from x402 Bazaar or curated list |

#### Payment Categories

| Category | Description |
|----------|-------------|
| `api_payment` | x402 pay-per-call API |
| `subscription` | Recurring service (Netflix, Spotify) |
| `purchase` | One-time purchase |
| `p2p_transfer` | Person-to-person transfer |
| `defi` | DeFi operations (swap, stake, lend) |
| `bill_payment` | Utilities, rent, invoices |
| `donation` | Tips, charity |
| `other` | Uncategorized |

### Get Intent Status

```http
GET /api/intents/:id
```

### List User Intents

```http
GET /api/users/:userId/intents?status=pending
```

### Update Intent Status

```http
PATCH /api/intents/:id/status
Content-Type: application/json

{
  "status": "signed",
  "txHash": "0x..."
}
```

---

## Supported Chains & Tokens

| Chain ID | Name | Tokens |
|----------|------|--------|
| 1 | Ethereum | ETH, USDC, USDT, DAI |
| 137 | Polygon | MATIC, USDC, USDT |
| 8453 | Base | ETH, USDC |

---

## Environment Variables

### Backend

```env
PORT=3001
```

### Web App

```env
VITE_API_URL=http://localhost:3001
VITE_USER_ID=demo-user
```

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
