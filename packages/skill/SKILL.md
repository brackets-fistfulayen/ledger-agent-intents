# ledger-intent — Agent Intent CLI

Submit payment intents for Ledger hardware signing. Agents propose transactions; users review and sign on their Ledger device.

## Install

Requires Node.js 20+ and pnpm.

```bash
git clone https://github.com/brackets-fistfulayen/ledger-agent-intents.git
cd ledger-agent-intents
pnpm install && pnpm build
```

Run with:

```bash
node packages/skill/bin/ledger-intent.js --help
```

Or link globally:

```bash
cd packages/skill && npm link
ledger-intent --help
```

## Setup

1. Provision an agent key in the web dashboard (Settings > Agent Keys)
2. Download the credential JSON file
3. Place it as `./agent-credential.json` or pass `--credential <path>`

## Commands

```bash
# Create a payment intent
ledger-intent send <amount> <token> to <address> [for "reason"] [--chain <id>] [--urgency <level>]

# Check intent status
ledger-intent status <intent-id>

# List your intents
ledger-intent list [--status <status>] [--limit <n>]

# Poll until intent reaches a terminal state (confirmed, rejected, failed, expired)
ledger-intent poll <intent-id> [--interval <seconds>] [--timeout <seconds>]

# Check API connectivity (no credential required)
ledger-intent health
```

## Examples

```bash
# Pay for podcast work on Base
ledger-intent send 50 USDC to 0x1234567890abcdef1234567890abcdef12345678 for "podcast intro music"

# Small payment on Base Sepolia testnet
ledger-intent send 0.01 USDC to 0xabcdefabcdefabcdefabcdefabcdefabcdefabcd --chain 84532

# Urgent payment
ledger-intent send 100 USDC to 0x1234567890abcdef1234567890abcdef12345678 --urgency high

# Check status of an intent
ledger-intent status int_1707048000_abc123

# Wait for user to sign (polls every 5s, times out after 5 min)
ledger-intent poll int_1707048000_abc123

# Wait longer with custom interval
ledger-intent poll int_1707048000_abc123 --interval 10 --timeout 600

# List pending intents
ledger-intent list --status pending

# Verify API is reachable
ledger-intent health --api https://your-app.vercel.app
```

## Authentication

Every request (except `health`) is signed with the **AgentAuth** protocol:

- The CLI loads your agent credential file (secp256k1 private key)
- Each request is signed with an EIP-191 `personal_sign` of `<timestamp>.<bodyHash>`
- The server verifies the signature against your registered public key
- No user passwords or session tokens needed

### Credential file

The credential JSON file is downloaded when you provision an agent key in the web dashboard. It contains:

```json
{
  "version": 1,
  "label": "My Agent",
  "trustchainId": "0x...",
  "privateKey": "0x...",
  "publicKey": "0x...",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

### Credential resolution order

1. `--credential <path>` flag (highest priority)
2. `AGENT_CREDENTIAL` environment variable
3. `./agent-credential.json` in the current directory
4. `~/.config/ledger-agent/credential.json`

## Global Options

```
--credential <path>    Path to agent credential JSON file
--api <url>            API base URL (default: http://localhost:3005)
--no-color             Disable colored output
-h, --help             Show help
-v, --version          Show version
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `AGENT_CREDENTIAL` | Path to credential file | (none) |
| `INTENT_API_URL` | API base URL | `http://localhost:3005` |
| `NO_COLOR` | Disable colored output | (unset) |

## Supported Chains & Tokens

| Chain ID | Name | Tokens |
|----------|------|--------|
| 8453 | Base | USDC |
| 84532 | Base Sepolia | USDC |
| 11155111 | Sepolia | USDC |

Default chain: **8453 (Base)**

## How It Works

1. Agent calls `ledger-intent send ...` with a signed AgentAuth header
2. Server validates the signature and queues the intent as `pending`
3. The CLI outputs a **shareable payment link** (`https://www.agentintents.io/pay/int_...`) — the agent shares this with the human
4. Human opens the link, connects their Ledger device, and reviews the transaction details
5. Human approves on the Ledger — the device signs the transaction
6. Transaction broadcasts on-chain; status moves to `confirmed`
7. Agent can poll for the final status with `ledger-intent poll <id>`

## Intent Status Lifecycle

```
pending → approved → broadcasting → confirmed
   │         │            │
   ├→ rejected  ├→ failed    └→ failed
   └→ expired   └→ expired
```

For x402 payments: `pending → authorized → executing → confirmed`

## Security

- **Agent never has wallet keys** — only a provisioned signing key for API auth
- **Every transaction requires human approval** on the Ledger device
- **Hardware enforcement** — the Ledger displays and signs the exact transaction
- **Full audit trail** — every status change is logged with timestamps
- **Credentials stay local** — the private key never leaves the credential file
