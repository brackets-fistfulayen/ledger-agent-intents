# ledger-intent — OpenClaw Skill

Submit transaction intents to Ledger Live for human review and hardware signing.

## Usage

```bash
# Send tokens
ledger-intent send <amount> <token> to <address> [for "reason"] [--chain <chainId>] [--urgency <level>]

# Check intent status
ledger-intent status <intent-id>

# List recent intents
ledger-intent list [--status pending|signed|confirmed|rejected]
```

## Examples

```bash
# Pay someone for podcast work
ledger-intent send 50 USDC to 0x1234...5678 for "podcast intro music"

# Send ETH on mainnet
ledger-intent send 0.5 ETH to vitalik.eth

# Urgent payment on Polygon
ledger-intent send 100 USDC to 0xabc...def for "time-sensitive invoice" --chain 137 --urgency high

# Check status
ledger-intent status int_1707048000_abc123

# List pending
ledger-intent list --status pending
```

## Environment

- `INTENT_API_URL` — Backend URL (default: http://localhost:3001)
- `INTENT_AGENT_ID` — Agent identifier (default: clouseau)
- `INTENT_AGENT_NAME` — Display name (default: Inspector Clouseau)
- `INTENT_USER_ID` — User ID for intents (default: demo-user)

## Supported Chains

| Chain ID | Name | Tokens |
|----------|------|--------|
| 1 | Ethereum | ETH, USDC, USDT, DAI |
| 137 | Polygon | MATIC, USDC, USDT |
| 8453 | Base | ETH, USDC |

## How It Works

1. Agent calls `ledger-intent send ...`
2. Skill creates structured intent and POSTs to backend
3. Backend queues intent, returns ID
4. User opens Ledger Live → Ledger Agent Payments app
5. User reviews on device and signs (or rejects)
6. Transaction broadcasts; agent can poll for status

## Security Model

- **Agent has NO private key access**
- **All transactions require human approval**
- **Hardware signature on Ledger device**
- **Full audit trail of all requests**
