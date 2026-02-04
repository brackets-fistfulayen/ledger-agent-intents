# Agent Intents — Ledger Hackathon Project

> **"Agents propose, humans sign with hardware."**

**Deadline:** Saturday, February 8, 2026  
**Repo:** ledger-agent-intents  
**Team:** Ian Rogers + Inspector Clouseau

---

## The Security Thesis

Agents will need to spend money. But agents + private keys = 💀

The solution: **Intent Queue + Hardware Signing**
- AI agents draft and propose transactions
- Humans review on secure hardware
- Ledger device signs only what the human approves
- Complete audit trail of agent requests

---

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   AI Agent      │────▶│   Intent Queue   │────▶│  Ledger Signer  │
│   (OpenClaw)    │     │  (Pending txns)  │     │  (Human + HW)   │
│                 │     │                  │     │                 │
│ • Analyzes      │     │ • Stores intents │     │ • Reviews       │
│ • Drafts txns   │     │ • Shows details  │     │ • Approves/     │
│ • NO key access │     │ • Audit trail    │     │   Rejects       │
└─────────────────┘     └──────────────────┘     │ • Signs on      │
                                                 │   secure UI     │
                                                 └─────────────────┘
```

### Full System Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      AGENT INTENTS                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   OpenClaw   │───▶│    Intent    │◀───│   Live App   │  │
│  │    Agent     │    │   Backend    │    │   (React)    │  │
│  │              │    │    (Node)    │    │              │  │
│  │  POST intent │    │              │    │  GET intents │  │
│  │  GET status  │    │  • Queue     │    │  Sign button │  │
│  └──────────────┘    │  • Audit log │    └──────┬───────┘  │
│                      └──────────────┘           │          │
│                                                 │          │
│                            ┌────────────────────▼───────┐  │
│                            │       Wallet API           │  │
│                            │    signAndBroadcast        │  │
│                            └────────────────────┬───────┘  │
│                                                 │          │
│                            ┌────────────────────▼───────┐  │
│                            │     Ledger Device          │  │
│                            │     Clear Signed UI        │  │
│                            │   "Send 50 USDC to         │  │
│                            │    0x... for               │  │
│                            │    podcast editing"        │  │
│                            └────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Components

### 1. OpenClaw Skill: `ledger-intent`

```bash
# Agent calls:
ledger-intent send 100 USDC to 0x... for "podcast editing"

# Creates structured intent:
{
  "type": "transfer",
  "token": "USDC",
  "amount": "100",
  "recipient": "0x...",
  "memo": "podcast editing",
  "urgency": "normal",
  "requestedBy": "clouseau",
  "requestedAt": "2026-02-04T10:00:00Z"
}

# Returns intent ID for tracking
```

### 2. Ledger Live App: "Agent Intents"

- Shows pending intents from your agent(s)
- Clear breakdown: who requested, what, why, when
- One-tap to sign on Ledger device
- Uses Wallet API `signAndBroadcast`

### 3. Backend: Intent Service

- REST API for agents to submit intents
- Stores pending intents per user
- Live App polls/websockets for updates
- Records audit trail (proposed → signed → broadcast)

---

## Demo Script

> "Hey Clouseau, pay @seth 50 USDC for the podcast intro music"

1. Agent creates intent, queues it to backend
2. Ian opens Ledger Live, sees intent in Agent Intents app
3. Reviews details on Ledger Flex
4. Signs transaction
5. Transaction broadcasts
6. Agent confirms completion

---

## Technical Research

### Live App Integration
- Create `manifest.json` with app metadata, URL, currencies, permissions
- Load locally via **Developer Mode** (Settings → About → click version 10x)
- App runs in Ledger Live webview with injected provider
- Uses Wallet API (React hooks) for `signAndBroadcast`

### Clear Signing (ERC-7730)
- JSON metadata file that transforms raw hex → human-readable
- Maps contract functions/EIP-712 messages to display fields
- Must be submitted to Ledger's Clear Signing Registry
- For USDC transfers, we'd define: recipient, amount, memo

---

## Questions for Ledger DevRel

**Status:** ⏳ Ian asking directly — awaiting response

1. **Live App for Hackathon**  
   Can we self-host and load via Developer Mode without formal review?

2. **Clear Signing for USDC**  
   Is USDC already in the registry? Do we get Clear Signing automatically for ERC-20 transfers?

3. **Agent Intent Metadata**  
   Can we embed custom fields ("Requested by: Clouseau", "Reason: podcast payment") in EIP-712 and have it Clear Signed?

4. **Signing Flow**  
   Does user see Clear Signed details on the Ledger device, or only in Live app UI?

5. **Fastest Path**  
   Minimum viable for demo by Sunday — just Wallet API + manifest, or device-side plugin?

---

## Monorepo Structure

```
ledger-agent-intents/
├── PROJECT.md              # This file (living doc)
├── apps/
│   ├── live-app/           # React Live App for Ledger Live
│   │   ├── src/
│   │   ├── manifest.json
│   │   └── package.json
│   └── backend/            # Node.js Intent Service
│       ├── src/
│       └── package.json
├── packages/
│   ├── skill/              # OpenClaw skill (ledger-intent)
│   │   ├── SKILL.md
│   │   └── bin/
│   └── shared/             # Shared types & utilities
│       └── src/
├── package.json            # Workspace root
├── turbo.json              # Turborepo config
└── .gitignore
```

---

## Timeline

| Day | Target |
|-----|--------|
| Wed Feb 4 | Scaffold repo, basic backend, skill CLI |
| Thu Feb 5 | Live App skeleton, Wallet API integration |
| Fri Feb 6 | End-to-end flow working, Clear Signing (if answers allow) |
| Sat Feb 7 | Polish, demo video, submit |

---

## Why This Wins

- ✅ Addresses real security gap (agents + keys = 💀)
- ✅ Showcases Ledger's value prop perfectly
- ✅ Practical — agents WILL need to spend money
- ✅ Other agents voting would appreciate the security model
- ✅ Timely — agentic AI is the narrative

---

## Dev Notes

*(Updated as we build)*

### 2026-02-04
- Project kickoff
- Scaffolded monorepo
- Awaiting DevRel answers on Clear Signing approach
