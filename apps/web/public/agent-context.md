# Agent Quickstart — Create a Payment Intent

**Prerequisites:** [Foundry](https://book.getfoundry.sh/getting-started/installation) (`cast`), `curl`, and `jq`.

## 1. Credential File

You need a JSON credential file with this shape:

```json
{
  "version": 1,
  "label": "My Agent",
  "trustchainId": "0x<owner-wallet-address>",
  "privateKey": "0x<hex-encoded-secp256k1-private-key>",
  "publicKey": "0x<hex-encoded-compressed-public-key>",
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

The human owner generates this file when registering your agent from the web UI.

> **Security:** Never commit this file to version control. Add it to `.gitignore` and restrict file permissions (`chmod 600`). The `privateKey` field is a secret — treat it like a password.

## 2. Build the AgentAuth Header

Every request to the API requires an `Authorization` header:

```
Authorization: AgentAuth <timestamp>.<bodyHash>.<signature>
```

| Part        | How to compute                                                                 |
|-------------|--------------------------------------------------------------------------------|
| `timestamp` | Current Unix epoch in **seconds** as a string (must be within 5 min of server time) |
| `bodyHash`  | `cast keccak "$BODY"` — returns `0x`-prefixed keccak256 hash. For GET requests (no body), use the literal string `0x` |
| `signature` | `cast wallet sign --private-key "$KEY" "$MESSAGE"` — returns `0x`-prefixed EIP-191 `personal_sign` over `"<timestamp>.<bodyHash>"` |

> **Important:** All hex values (`bodyHash`, `signature`) **must** include the `0x` prefix. Omitting it will result in a `401 Authentication failed` error.

### Body hashing

The `bodyHash` is computed over the **exact bytes** sent in the request body. Write the JSON body as a compact literal string (no extra whitespace between keys and values) to ensure a deterministic hash.

## 3. Send an Intent

**`POST https://www.agentintents.io/api/intents`**

### Request body

```json
{"agentId":"my-agent","agentName":"My Agent","details":{"type":"transfer","token":"USDC","amount":"1.00","recipient":"0xRecipientAddress","chainId":8453,"memo":"Reason for payment"},"urgency":"normal","expiresInMinutes":60}
```

### Response (`201 Created`)

```json
{
  "success": true,
  "intent": {
    "id": "int_1770399036079_804497de",
    "userId": "0x20bfb083c5adacc91c46ac4d37905d0447968166",
    "agentId": "my-agent",
    "agentName": "My Agent",
    "details": { ... },
    "urgency": "normal",
    "status": "pending",
    "trustChainId": "0x20bfb083c5adacc91c46ac4d37905d0447968166",
    "createdAt": "2026-02-06T17:30:36.127Z",
    "expiresAt": "2026-02-06T18:30:36.080Z",
    "statusHistory": [
      { "status": "pending", "timestamp": "2026-02-06T17:30:36.222Z" }
    ]
  },
  "paymentUrl": "https://www.agentintents.io/pay/int_1770399036079_804497de"
}
```

Share the `paymentUrl` with the human so they can review and sign the transaction.

## 4. Poll for Completion

**`GET https://www.agentintents.io/api/intents/<intent-id>`**

Poll until `status` is one of the terminal states: `confirmed`, `rejected`, `failed`, or `expired`.

---

## Complete Example

```bash
#!/usr/bin/env bash
set -euo pipefail

# ── Configuration ────────────────────────────────────────────────
CREDENTIAL_FILE="agent-credential.json"
PRIVATE_KEY=$(jq -r '.privateKey' "$CREDENTIAL_FILE")
AGENT_LABEL=$(jq -r '.label' "$CREDENTIAL_FILE")

# ── 1. Build compact JSON body ──────────────────────────────────
BODY=$(jq -cn \
  --arg agentName "$AGENT_LABEL" \
  '{
    agentId: "my-agent",
    agentName: $agentName,
    details: {
      type: "transfer",
      token: "USDC",
      amount: "1.00",
      recipient: "0xRecipientAddress",
      chainId: 8453,
      memo: "Reason for payment"
    },
    urgency: "normal",
    expiresInMinutes: 60
  }')

# ── 2. Compute auth header ──────────────────────────────────────
TIMESTAMP=$(date +%s)
BODY_HASH=$(cast keccak "$BODY")
SIGNATURE=$(cast wallet sign --private-key "$PRIVATE_KEY" "${TIMESTAMP}.${BODY_HASH}")

# ── 3. Send intent ──────────────────────────────────────────────
RESPONSE=$(curl -s -X POST "https://www.agentintents.io/api/intents" \
  -H "Content-Type: application/json" \
  -H "Authorization: AgentAuth ${TIMESTAMP}.${BODY_HASH}.${SIGNATURE}" \
  -d "$BODY")

echo "$RESPONSE" | jq .

PAYMENT_URL=$(echo "$RESPONSE" | jq -r '.paymentUrl')
echo ""
echo "Share this link with the human: $PAYMENT_URL"

# ── 4. Poll for completion ──────────────────────────────────────
INTENT_ID=$(echo "$RESPONSE" | jq -r '.intent.id')
STATUS="pending"

for i in $(seq 1 120); do
  case "$STATUS" in confirmed|rejected|failed|expired) break ;; esac
  sleep 30
  POLL_TS=$(date +%s)
  POLL_SIG=$(cast wallet sign --private-key "$PRIVATE_KEY" "${POLL_TS}.0x")
  STATUS=$(curl -s "https://www.agentintents.io/api/intents/${INTENT_ID}" \
    -H "Authorization: AgentAuth ${POLL_TS}.0x.${POLL_SIG}" \
    | jq -r '.intent.status')
  echo "Poll $i: status=$STATUS"
done

echo "Final status: $STATUS"
```

> **Tip:** `cast keccak` and `cast wallet sign` both return `0x`-prefixed output — no manual hex formatting needed.

## Supported Chains

| Chain ID   | Name         | Token | Notes   |
|------------|--------------|-------|---------|
| 8453       | Base         | USDC  | Mainnet |
| 84532      | Base Sepolia | USDC  | Testnet |
| 11155111   | Sepolia      | USDC  | Testnet |

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `401 Authentication failed` | Signature or body hash is malformed | Ensure `bodyHash` and `signature` are `0x`-prefixed hex strings |
| `401 Authentication failed` | Timestamp drift | Ensure your system clock is accurate (within 5 minutes of server time) |
| `401 Authentication failed` | Body hash mismatch | Ensure you hash the **exact** bytes sent as the request body (compact JSON, no trailing newline) |
