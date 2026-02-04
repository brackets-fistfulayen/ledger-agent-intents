# Agent Intents 🤖🔐

> **"Agents propose, humans sign with hardware."**

A secure bridge between AI agents and blockchain transactions. Your agents can draft and propose transactions, but only **you** can sign them — on your Ledger device.

[![Hackathon](https://img.shields.io/badge/USDC%20Hackathon-Moltbook-blue)](https://www.moltbook.com/m/usdc)
[![Deadline](https://img.shields.io/badge/Deadline-Feb%208%2C%202026-red)](https://www.circle.com/blog/openclaw-usdc-hackathon-on-moltbook)

---

## The Problem

AI agents are getting powerful. They can read your emails, manage your calendar, write code, and browse the web. Soon they'll need to **spend money** on your behalf.

But agents + private keys = 💀

One prompt injection, one compromised skill, one bad actor — and your funds are gone.

## The Solution

**Agent Intent Queue + Ledger Hardware Signing**

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

- ✅ Agents can propose any transaction
- ✅ Humans review full details before signing
- ✅ Hardware wallet security (Ledger)
- ✅ Complete audit trail
- ✅ Sleep well at night

---

## Quick Start

### Prerequisites

- Node.js 20+
- npm 10+
- A Ledger device (for signing)

### Install & Run

```bash
# Clone the repo
git clone https://github.com/fistfulayen/ledger-agent-intents.git
cd ledger-agent-intents

# Install dependencies
npm install

# Build shared types
npm run build -w @agent-intents/shared

# Start the backend (Terminal 1)
npm run dev -w @agent-intents/backend

# Start the web app (Terminal 2)
npm run dev -w @agent-intents/web-app
```

### Test with the CLI

```bash
# Create an intent
node packages/skill/bin/ledger-intent.js send 50 USDC to 0x1234... for "podcast payment"

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
│   └── live-app/         # React web app (review + sign)
├── packages/
│   ├── shared/           # TypeScript types
│   └── skill/            # OpenClaw skill (ledger-intent CLI)
├── PROJECT.md            # Living project doc
└── README.md             # You are here
```

### Components

| Component | Description |
|-----------|-------------|
| **Backend** | REST API for creating, listing, and updating intents |
| **Web App** | React UI with Ledger Button for reviewing and signing |
| **Skill** | CLI for agents to create intents (`ledger-intent send ...`) |
| **Shared** | TypeScript types for Intent, Status, etc. |

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
    "memo": "podcast payment"
  }
}
```

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

## Roadmap

- [x] Core intent queue system
- [x] Backend API
- [x] Web app with Ledger Button
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

## Team

- **Ian Rogers** — [@iancr](https://x.com/iancr)
- **Inspector Clouseau** — AI Assistant (OpenClaw)
- **Ledger Team** — Contributors

---

## Hackathon

This project is a submission to the [USDC OpenClaw Hackathon on Moltbook](https://www.circle.com/blog/openclaw-usdc-hackathon-on-moltbook).

- **Prize Pool:** $30,000 USDC
- **Deadline:** Sunday, Feb 8, 2026 at 12:00 PM PST
- **Track:** Agentic Commerce / Best OpenClaw Skill

---

## License

MIT

---

*"Your agent has root access. Your keys don't."*
