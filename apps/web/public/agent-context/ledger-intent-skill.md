# ledger-intent — Agent Intent CLI Skill

Use this skill to create payment intents that require human approval on a Ledger hardware wallet. You propose transactions; the human reviews and signs on their device.

## Setup

You need a credential JSON file provisioned by the human owner. It should be at `./agent-credential.json` or passed via `--credential <path>`.

## Commands

```bash
# Create a payment intent
ledger-intent send <amount> <token> to <address> [for "reason"] [--chain <id>] [--urgency <level>]

# Check intent status
ledger-intent status <intent-id>

# List your intents
ledger-intent list [--status <status>] [--limit <n>]

# Poll until terminal state (confirmed, rejected, failed, expired)
ledger-intent poll <intent-id> [--interval <seconds>] [--timeout <seconds>]

# Check API connectivity (no credential required)
ledger-intent health
```

## Typical Workflow

1. Create an intent:
   ```bash
   ledger-intent send 50 USDC to 0x1234567890abcdef1234567890abcdef12345678 for "podcast intro music"
   ```
2. The output includes a **shareable payment link** like `https://www.agentintents.io/pay/int_...` — **share this link with the human** so they can review the transaction details and approve it on their Ledger device. This is the key step: the human must open this link and sign.
3. Poll until the human signs or rejects:
   ```bash
   ledger-intent poll <intent-id>
   ```
4. Check the final status — `confirmed` means the on-chain transaction went through. `rejected` means the human declined.

## Examples

```bash
# Pay on Base (default chain)
ledger-intent send 50 USDC to 0x1234567890abcdef1234567890abcdef12345678 for "podcast music"

# Pay on Base Sepolia testnet
ledger-intent send 0.01 USDC to 0xabcdefabcdefabcdefabcdefabcdefabcdefabcd --chain 84532

# Urgent payment
ledger-intent send 100 USDC to 0x1234567890abcdef1234567890abcdef12345678 --urgency high

# Check status
ledger-intent status int_1707048000_abc123

# Wait for signing (polls every 5s, 5 min timeout)
ledger-intent poll int_1707048000_abc123

# Wait longer
ledger-intent poll int_1707048000_abc123 --interval 10 --timeout 600

# List pending intents
ledger-intent list --status pending
```

## Global Options

| Flag | Description |
|------|-------------|
| `--credential <path>` | Path to agent credential JSON file |
| `--api <url>` | API base URL (default: `https://www.agentintents.io`) |
| `--no-color` | Disable colored output |
| `-h, --help` | Show help |
| `-v, --version` | Show version |

## Credential Resolution

The CLI looks for credentials in this order:
1. `--credential <path>` flag
2. `AGENT_CREDENTIAL` environment variable
3. `./agent-credential.json` in the current directory
4. `~/.config/ledger-agent/credential.json`

## Supported Chains & Tokens

| Chain ID | Name | Token |
|----------|------|-------|
| 8453 | Base | USDC |
| 84532 | Base Sepolia | USDC |
| 11155111 | Sepolia | USDC |

Default chain: **8453 (Base)**

## Status Lifecycle

```
pending → approved → broadcasting → confirmed
   │         │            │
   ├→ rejected  ├→ failed    └→ failed
   └→ expired   └→ expired
```

Terminal states: `confirmed`, `rejected`, `failed`, `expired`. Stop polling when you reach one.

## Alternative: Direct API

If you can't use the CLI, you can call the API directly with HTTP. See the full guide at https://www.agentintents.io/agent-context#credential-file

Every request needs an `Authorization: AgentAuth <timestamp>.<bodyHash>.<signature>` header where:
- `timestamp`: Unix epoch seconds
- `bodyHash`: keccak256 of the request body (or `0x` for GET)
- `signature`: EIP-191 personal_sign of `<timestamp>.<bodyHash>`

### Create intent
```
POST https://www.agentintents.io/api/intents
```

### Get intent status
```
GET https://www.agentintents.io/api/intents/<intent-id>
```

### List intents
```
GET https://www.agentintents.io/api/intents?status=pending
```
