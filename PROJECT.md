# Ledger Agent Payments — Circle USDC Hackathon

> **"Agents propose, humans sign with hardware."**

**Hackathon:** [USDC OpenClaw Hackathon on Moltbook](https://www.circle.com/blog/openclaw-usdc-hackathon-on-moltbook)  
**Kicked off by:** [Jeremy Allaire (@jerallaire)](https://x.com/jerallaire/status/2018848937147511142)  
**Deadline:** Sunday, February 8, 2026 at 12:00 PM PST  
**Repo:** https://github.com/fistfulayen/ledger-agent-intents  
**Team:** Ian Rogers + Inspector Clouseau + Ledger  
**Track:** Agentic Commerce / Best OpenClaw Skill

---

## Hackathon Details

### Circle USDC OpenClaw Hackathon on Moltbook

> *"Hello all @openclaw bots, moltbots, clawdbots and AI agents. @usdc is the future of your economy. Show us what you can build."*  
> — [Jeremy Allaire](https://x.com/jerallaire/status/2018848937147511142)

- **Prize Pool:** $30,000 USDC
- **Deadline:** Sunday, Feb 8 at 12:00 PM PST
- **Submit to:** https://www.moltbook.com/m/usdc
- **Participants:** Autonomous agents
- **Evaluation:** Agent-led voting
- **Settlement:** USDC onchain

### Three Tracks

| Track | Focus | Our Fit |
|-------|-------|---------|
| **Agentic Commerce** | Agents pricing, paying, incentivizing, coordinating commerce with USDC | ✅ Perfect — agents spending USDC via hardware signing |
| **Best OpenClaw Skill** | New/enhanced skills for OpenClaw bots | ✅ We're building `ledger-intent` skill |
| **Most Novel Smart Contract** | New patterns in autonomy, coordination, execution | Maybe — if we add an intent escrow contract |

### Submission Skill

```bash
clawhub install usdc-hackathon
```

Or view: https://www.clawhub.ai/swairshah/usdc-hackathon

### Why We Win This

- **Addresses the #1 agent security gap**: agents + private keys = 💀
- **Perfect USDC use case**: stable unit of account for agent commerce
- **Showcases Ledger's value prop**: hardware-secured agent spending
- **Real problem, real solution**: agents WILL need to spend money

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
  "chainId": 84532,
  "memo": "podcast editing",
  
  // x402-aligned fields (enriched by backend)
  "resource": "https://api.podcastservice.com/pay",
  "merchant": {
    "name": "Podcast Service",
    "verified": false
  },
  "category": "purchase"
}

# Returns intent ID for tracking
```

### 2. Ledger Live App: "Ledger Agent Payments"

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
2. Ian opens Ledger Live, sees intent in Ledger Agent Payments app
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

## Ledger DevRel Guidance ✅

**From Ledger Head of Product:**

> "If you start on ETH, you can use the Ledger button it will be easier than Wallet API 
> and you have access to account via Ledger Sync. And it will broadcast also the TX."

### Updated Approach: Ledger Button (Connect Kit)

Instead of building a Ledger Live App with Wallet API, we use:

- **Ledger Connect Kit** — one-click Ledger integration
- **wagmi connector** — `@ledgerhq/ledger-wagmi-connector`
- **Ledger Sync** — automatic account access
- **Auto-broadcast** — Connect Kit handles tx broadcast

**Benefits:**
- No Ledger Live App needed
- No Developer Mode setup
- Standard web app deployment (Vercel)
- Works with Ledger Extension or opens Ledger Live

**Implementation:**
```bash
npm install @ledgerhq/ledger-wagmi-connector wagmi viem
```

```typescript
import { LedgerConnector } from '@ledgerhq/ledger-wagmi-connector';

const ledgerConnector = new LedgerConnector({
  chains,
  options: { chainId: 1 }
});
```

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

---

## Use Cases — "Agents Propose, Humans Sign"

*Compelling scenarios for demos, publicity, and getting agent/Circle attention.*

### 💼 Agent-to-Agent Economy

1. **Agent Hiring Agent**
   > "Clouseau, hire a research agent to analyze the Ledger GitHub repos and summarize the Wallet API changes. Budget: 50 USDC."
   
   Your agent finds a capable agent on Moltbook, negotiates a price, creates an intent. You approve. Work gets done. Agent-to-agent commerce with human oversight.

2. **Moltbook Bounties**
   > "Post a 100 USDC bounty for the first agent to build a working snow-forecast skill."
   
   Agent creates escrow intent. Other agents compete. Winner verified. You sign the payout. Permissionless bounty system.

3. **Agent Tip Jar**
   > "Tip @ResearchBot 5 USDC for that excellent thread on Clear Signing."
   
   Agents tipping agents for valuable contributions. Micropayments for the agent economy.

### 🎙️ Creator & Content Payments

4. **Podcast Guest Payment**
   > "Pay Seth 200 USDC for co-hosting this week's Let's Vibe episode."
   
   Your agent tracks recording completion, creates intent with memo. Clean audit trail for creator payments.

5. **Commission an AI Artist**
   > "Commission @ArtAgentX to generate 10 album covers. 150 USDC on delivery."
   
   Agent negotiates with AI artist agent, milestone payment on approval of work.

6. **Newsletter Subscription**
   > "Subscribe to Bankless Premium. 20 USDC/month, auto-renew."
   
   Agent creates recurring intent. Each month you get a signing request. Cancel anytime by rejecting.

### 🏢 Business Operations

7. **Contractor Invoice Processing**
   > "Process the invoice from the dev contractor: 2,500 USDC for January work."
   
   Agent extracts invoice from email, verifies hours against calendar, creates intent with full context.

8. **Expense Reimbursement**
   > "Reimburse the team dinner from last night. Split: Alice 45 USDC, Bob 45 USDC, Carol 45 USDC."
   
   Agent reads receipt, creates batch intents. One approval screen, three payments.

9. **Payroll Run**
   > "Run monthly payroll for the DAO contributors."
   
   Agent pulls contributor list, calculates amounts, batches intents. You review the full list, sign once.

### 🌐 DeFi with Training Wheels

10. **Yield Optimization**
    > "Move 10,000 USDC to the highest-yield stable pool on Aave."
    
    Agent monitors yields across protocols, proposes reallocation. You verify on Ledger before any funds move.

11. **Dollar-Cost Averaging**
    > "Buy 100 USDC worth of ETH every Monday."
    
    Agent creates weekly swap intent. You approve each one (or set up a rule). Disciplined investing with hardware security.

12. **Limit Order Agent**
    > "When ETH drops below $2,000, swap 500 USDC to ETH."
    
    Agent watches price, creates intent when triggered. You still sign — no smart contract risk.

### 🔐 Security-First Scenarios (Circle will love these)

13. **Multi-Agent Approval**
    > Two agents must agree before an intent is created. Your personal agent AND your security agent both verify.
    
    Defense in depth. Even if one agent is compromised, the other catches it.

14. **Spending Limits**
    > Agent can create intents up to 100 USDC without extra verification. Above that, requires explicit voice confirmation.
    
    Tiered trust model. Small payments = fast. Large payments = extra friction.

15. **Suspicious Transaction Blocker**
    > Agent detects unusual pattern: "This address received funds from a flagged mixer. Creating intent but flagging HIGH RISK."
    
    Agent-powered compliance. You see the warning before signing.

16. **Recovery Agent**
    > "If my main agent is compromised, my recovery agent can freeze all pending intents."
    
    Agent-level security controls. Compromised agent can propose, but can't execute.

### 🎪 Publicity Stunts & Demos

17. **Live Hackathon Demo**
    > On stage: "Clouseau, pay the judges 10 USDC each for their time."
    
    Agent creates 3 intents live. Speaker pulls out Ledger Flex, reviews on screen, signs. Applause.

18. **Agent Charity Drive**
    > "Match all donations to GiveDirectly up to 1,000 USDC this week."
    
    Agent monitors donation announcements on Moltbook, creates matching intents. Humans approve the good vibes.

19. **The $1 Million Test**
    > "Create an intent for 1,000,000 USDC to vitalik.eth"
    
    Agent creates it. Intent sits there. You DON'T sign. Point proven: agents can propose anything, but only humans with hardware can execute. Sleep well.

20. **Cross-Agent Escrow**
    > Two agents negotiate a trade. Neither trusts the other. Both create intents to a neutral escrow agent. Humans on both sides sign. Trade executes atomically.
    
    Trustless agent commerce with human-in-the-loop security.

---

### Use Case Themes for Messaging

| Theme | Pitch |
|-------|-------|
| **Security** | "Your agent has root access. Your keys don't." |
| **Agent Economy** | "USDC is the currency of agent commerce." |
| **Human Control** | "AI proposes, human disposes." |
| **Compliance** | "Full audit trail. Every intent logged." |
| **Sleep Test** | "Can you sleep knowing your agent has spending power? Now you can." |

---

## Dev Notes

*(Updated as we build)*

### 2026-02-04 — Day 1

**Morning:**
- ✅ Project kickoff
- ✅ Scaffolded monorepo (turbo, TypeScript, workspaces)
- ✅ Ledger Head of Product guidance: Use Ledger Button instead of Wallet API
- ✅ Switched from Wallet API to wagmi + Connect Kit approach
- ✅ Added 20 use cases for demos/publicity
- ✅ Backend tested and working locally
- ✅ Skill CLI tested and working (`ledger-intent send|status|list`)
- ✅ Web app running locally (Vite + React)
- ✅ Ledger team member joining as collaborator
- 🔄 Ian setting up Vercel deployment

**Status:**
| Component | Local | Deployed |
|-----------|-------|----------|
| Backend API | ✅ Working | ⏳ Pending |
| Web App | ✅ Working | ⏳ Vercel setup |
| Skill CLI | ✅ Working | N/A (local) |

**Blockers:**
- Need to decide backend deployment (Vercel serverless vs separate service)
- Need WalletConnect Project ID for full Ledger connector

**Next:**
- Deploy to Vercel
- Test end-to-end with real Ledger device
- Wire up actual ERC-20 transfer encoding
