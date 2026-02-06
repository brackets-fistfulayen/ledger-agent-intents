# Agent Payments with Ledger API — Agent Integration Guide

> **Base URL**: `https://agent-intents-web.vercel.app` (production)
> **OpenAPI spec**: `GET /openapi.json`
> **Static HTML docs**: `GET /docs` (fetch-friendly, no JS required)
> **Health check**: `GET /api/health`

---

## What This Is

Agent Payments with Ledger is an **intent-based payment system** for AI agents. You (the agent) **propose** a transaction; a human **reviews and signs** it on Ledger hardware. You never touch private keys.

```
Agent (you)                   Intent Queue (this API)         Human + Ledger
─────────────                 ──────────────────────          ──────────────
POST /api/intents ──────────► stores intent (pending) ──────► reviews in web UI
                                                              approves / rejects
GET /api/intents/:id ◄──────── status: confirmed ◄────────── signs on device
                               + txHash                       broadcast to chain
```

---

## Authentication

### AgentAuth (required for creating intents)

Every authenticated request must include:

```
Authorization: AgentAuth <timestamp>.<bodyHash>.<signature>
```

| Part | Description |
|------|-------------|
| `timestamp` | Unix epoch **seconds** (must be within 5 minutes of server time) |
| `bodyHash` | `keccak256` of the raw JSON body as hex string. Use `"0x"` for GET requests |
| `signature` | EIP-191 `personal_sign` of the string `"<timestamp>.<bodyHash>"` using the agent's secp256k1 private key |

The server recovers the signer address from the signature and matches it against registered agent public keys in the `trustchain_members` table.

### Session Cookie (for web UI users only)

The web app uses EIP-712 challenge/verify to establish a session cookie (`ai_session`). This is used for human actions (approve, reject, authorize) — agents do not use this.

---

## Agent Lifecycle (Step by Step)

### Step 1: Register Your Agent

The human owner registers your agent key from the web UI by signing an authorization message on their Ledger. This creates a `TrustchainMember` entry linking your public key to their wallet.

**You receive:**
- A secp256k1 private key (hex-encoded)
- The `trustchainId` (the human's wallet address)
- Your `memberId` (UUID)

### Step 2: Create an Intent

```bash
curl -X POST https://agent-intents-web.vercel.app/api/intents \
  -H "Content-Type: application/json" \
  -H "Authorization: AgentAuth <timestamp>.<bodyHash>.<signature>" \
  -d '{
    "agentId": "my-research-bot",
    "agentName": "Research Assistant",
    "details": {
      "type": "transfer",
      "token": "USDC",
      "amount": "5.00",
      "recipient": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      "chainId": 8453,
      "memo": "API access fee for CoinGecko Pro"
    },
    "urgency": "normal",
    "expiresInMinutes": 60
  }'
```

**Response (201):**
```json
{
  "success": true,
  "intent": {
    "id": "int_1707048000_abc12345",
    "userId": "0xabcdef1234567890abcdef1234567890abcdef12",
    "agentId": "my-research-bot",
    "agentName": "Research Assistant",
    "status": "pending",
    "details": { ... },
    "urgency": "normal",
    "createdAt": "2026-02-06T10:00:00.000Z",
    "expiresAt": "2026-02-06T11:00:00.000Z",
    "trustChainId": "0xabcdef1234567890abcdef1234567890abcdef12",
    "createdByMemberId": "550e8400-e29b-41d4-a716-446655440000",
    "statusHistory": [
      { "status": "pending", "timestamp": "2026-02-06T10:00:00.000Z" }
    ]
  },
  "paymentUrl": "https://agent-intents-web.vercel.app/pay/int_1707048000_abc12345"
}
```

**Important:** The `paymentUrl` is a direct link the human can open to review and sign the intent. Share this with the user.

### Step 3: Poll for Status

```bash
curl https://agent-intents-web.vercel.app/api/intents/int_1707048000_abc12345 \
  -H "Authorization: AgentAuth <timestamp>.<bodyHash>.<signature>"
```

Poll until `status` reaches a terminal state: `confirmed`, `rejected`, `failed`, or `expired`.

**Recommended polling intervals:**
| Urgency | Interval |
|---------|----------|
| `critical` | 5 seconds |
| `high` | 15 seconds |
| `normal` | 30 seconds |
| `low` | 60 seconds |

### Step 4: Update Status (agents)

Agents can update intent status to: `executing`, `confirmed`, or `failed`.

This is used in the **x402 flow** — after the human authorizes payment, the agent retries the HTTP request with the payment signature, then reports the outcome.

```bash
curl -X POST https://agent-intents-web.vercel.app/api/intents/status \
  -H "Content-Type: application/json" \
  -H "Authorization: AgentAuth <timestamp>.<bodyHash>.<signature>" \
  -d '{
    "id": "int_1707048000_abc12345",
    "status": "confirmed",
    "note": "x402 payment settled successfully"
  }'
```

---

## x402 Payment Flow (Pay-Per-Call APIs)

When your agent encounters an HTTP `402 Payment Required` response from an x402 server:

1. **Parse** the `PAYMENT-REQUIRED` header to extract payment requirements
2. **Create an intent** with x402 context in the `details.x402` field
3. **Share the `paymentUrl`** with the human
4. **Poll** until status reaches `authorized` — the human has signed the EIP-3009 `TransferWithAuthorization`
5. **Fetch the intent** (with AgentAuth) — the response includes `details.x402.paymentSignatureHeader`
6. **Retry** the original HTTP request with `PAYMENT: <paymentSignatureHeader>` header
7. **Update status** to `confirmed` (with settlement receipt) or `failed`

```bash
# Step 2: Create intent with x402 context
curl -X POST /api/intents \
  -H "Authorization: AgentAuth ..." \
  -d '{
    "agentId": "my-agent",
    "details": {
      "type": "transfer",
      "token": "USDC",
      "amount": "0.01",
      "recipient": "0xPayTo...",
      "chainId": 8453,
      "memo": "x402 payment for api.coingecko.com/pro/v1/...",
      "resource": "https://api.coingecko.com/pro/v1/coins/bitcoin",
      "category": "api_payment",
      "x402": {
        "resource": { "url": "https://api.coingecko.com/pro/v1/coins/bitcoin" },
        "accepted": {
          "scheme": "exact",
          "network": "eip155:8453",
          "amount": "10000",
          "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
          "payTo": "0xPayTo..."
        }
      }
    }
  }'
```

---

## Intent Status Lifecycle

```
                    ┌──────────┐
                    │ pending  │  (agent created)
                    └────┬─────┘
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
         ┌─────────┐ ┌─────────┐ ┌──────────┐
         │approved │ │rejected │ │ expired  │
         └────┬────┘ └─────────┘ └──────────┘
              │
     ┌────────┼─────────┐
     ▼                   ▼
┌────────────┐    ┌────────────┐
│broadcasting│    │ authorized │  (x402 path)
└─────┬──────┘    └──────┬─────┘
      │                  │
      │             ┌────┴─────┐
      │             ▼          │
      │       ┌──────────┐    │
      │       │ executing │    │
      │       └─────┬────┘    │
      │             │         │
      ▼             ▼         ▼
┌──────────┐  ┌──────────┐ ┌──────────┐
│confirmed │  │confirmed │ │  failed  │
└──────────┘  └──────────┘ └──────────┘
```

| Status | Set By | Description |
|--------|--------|-------------|
| `pending` | System | Intent created, awaiting human review |
| `approved` | Human | Human approved, ready to sign on device |
| `rejected` | Human | Human rejected the intent |
| `broadcasting` | Human | Signed on Ledger, transaction broadcasting to chain |
| `authorized` | Human | x402 payment signature created, agent can use it |
| `executing` | Agent | Agent is retrying HTTP request with payment signature |
| `confirmed` | Agent/System | Transaction confirmed on-chain or x402 settled |
| `failed` | Agent/System | Transaction or payment failed |
| `expired` | Cron | Intent expired without action (checked every minute) |

**Terminal states** (no further transitions): `rejected`, `confirmed`, `failed`, `expired`

---

## API Reference

### POST /api/intents

Create a new intent. **Requires AgentAuth.**

**Request body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `agentId` | string | Yes | Your agent's unique identifier |
| `agentName` | string | No | Display name (defaults to `agentId`) |
| `details` | object | Yes | Transaction details (see below) |
| `details.type` | string | Yes | Must be `"transfer"` |
| `details.token` | string | Yes | Token symbol: `"USDC"`, `"ETH"` |
| `details.amount` | string | Yes | Human-readable amount (e.g., `"50"`, `"0.01"`) |
| `details.recipient` | string | Yes | Destination address (`0x...`) |
| `details.chainId` | number | Yes | Chain ID (see Supported Chains) |
| `details.memo` | string | No | Human-readable reason |
| `details.tokenAddress` | string | No | ERC-20 contract address (auto-filled for known tokens) |
| `details.resource` | string | No | x402 resource URL being paid for |
| `details.category` | string | No | Payment category (see below) |
| `details.x402` | object | No | Full x402 payment context |
| `urgency` | string | No | `"low"` \| `"normal"` \| `"high"` \| `"critical"` (default: `"normal"`) |
| `expiresInMinutes` | number | No | Minutes until expiry (default: 1440 = 24 hours) |

**Payment categories:** `api_payment`, `subscription`, `purchase`, `p2p_transfer`, `defi`, `bill_payment`, `donation`, `other`

**Response (201):** `{ "success": true, "intent": Intent, "paymentUrl": string }`

**Errors:**
| Code | Error | Cause |
|------|-------|-------|
| 400 | Validation error | Missing or invalid fields |
| 401 | Authentication failed | Missing/invalid AgentAuth header |
| 429 | Rate limit exceeded | Max 10 intents per agent per minute |
| 503 | Service temporarily unavailable | Database error |

---

### GET /api/intents/:id

Get intent by ID. **No auth required** (returns sanitized response). **With AgentAuth** from owning agent, returns full x402 secrets (paymentSignatureHeader, paymentPayload, etc.).

**Response (200):** `{ "success": true, "intent": Intent }`

**Errors:** `400` (missing ID), `404` (not found)

---

### GET /api/intents?userId=...&status=...&limit=...

List intents for a user. **No auth required.**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | string | Yes | Wallet address |
| `status` | string | No | Filter: `pending`, `approved`, `rejected`, `broadcasting`, `authorized`, `executing`, `confirmed`, `failed`, `expired` |
| `limit` | number | No | 1–100 (default: 50) |

**Response (200):** `{ "success": true, "intents": Intent[] }`

---

### POST /api/intents/status

Update intent status. **Requires AgentAuth or Session Cookie.**

**Request body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Intent ID |
| `status` | string | Yes | New status |
| `txHash` | string | No | Transaction hash |
| `note` | string | No | Audit note |
| `paymentSignatureHeader` | string | No | x402 payment signature header |
| `paymentPayload` | object | No | x402 payment payload |
| `settlementReceipt` | object | No | x402 settlement receipt |

**Permission matrix:**

| Auth type | Allowed statuses |
|-----------|-----------------|
| AgentAuth | `executing`, `confirmed`, `failed` |
| Session Cookie | `approved`, `rejected`, `authorized`, `broadcasting` |

**Errors:** `400`, `401`, `403` (ownership/permission), `404`, `409` (invalid state transition)

---

### PATCH /api/intents/:id/status

Legacy alternative to `POST /api/intents/status`. Same behavior, but uses path param for intent ID instead of body. Prefer the POST route.

---

### GET /api/users/:userId/intents

Equivalent to `GET /api/intents?userId=...`. **Requires Session Cookie.** The caller can only list their own intents.

---

### POST /api/agents/register

Register a new agent. **No auth header needed** — authorization is via EIP-191 signature in the body.

**Request body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `trustChainId` | string | Yes | Owner's wallet address |
| `agentPublicKey` | string | Yes | `0x`-prefixed hex-encoded secp256k1 compressed public key |
| `agentLabel` | string | No | Display name (default: "Unnamed Agent") |
| `authorizationSignature` | string | Yes | EIP-191 `personal_sign` of authorization message (see below) |

**Authorization message format:**
```
Authorize agent key for Ledger Agent Payments
Key: <agentPublicKey>
Label: <agentLabel>
Identity: <trustChainId>
```

**Response (201):** `{ "success": true, "member": TrustchainMember }`

**Errors:** `400`, `403` (signature mismatch), `409` (already registered), `429` (max 5 per minute per wallet)

---

### GET /api/agents?trustchainId=...

List agents for a trustchain. **Requires Session Cookie.**

---

### GET /api/agents/:id

Get agent by ID. **Requires Session Cookie.**

---

### POST /api/agents/revoke

Revoke an agent. **Requires Session Cookie.**

**Body:** `{ "id": "<agent-uuid>" }`

---

### DELETE /api/agents/:id

Legacy alternative to `POST /api/agents/revoke`.

---

### POST /api/auth/challenge

Issue an EIP-712 authentication challenge for wallet-based session auth.

**Body:** `{ "walletAddress": string, "chainId?": number }`

**Response:** `{ "success": true, "challengeId": string, "typedData": EIP712TypedData }`

---

### POST /api/auth/verify

Verify EIP-712 signature and establish session cookie.

**Body:** `{ "challengeId": string, "signature": string }`

**Response:** `{ "success": true, "walletAddress": string }` + sets `ai_session` cookie (7 days)

---

### POST /api/auth/logout

Clear session cookie.

---

### GET /api/me

Get authenticated wallet from session cookie. **Requires Session Cookie.**

**Response:** `{ "success": true, "walletAddress": string }`

---

### GET /api/health

Health check.

**Response:** `{ "success": true, "status": "ok", "timestamp": "..." }`

---

## Response Envelope

All endpoints return JSON with a consistent envelope:

```json
// Success
{ "success": true, "intent": { ... } }

// Error
{ "success": false, "error": "Human-readable error message" }
```

---

## Supported Chains

| Chain ID | Name | Explorer |
|----------|------|----------|
| 8453 | Base | https://basescan.org |
| 11155111 | Sepolia | https://sepolia.etherscan.io |
| 84532 | Base Sepolia | https://sepolia.basescan.org |

## Supported Tokens

| Chain | Token | Contract Address | Decimals |
|-------|-------|-----------------|----------|
| Base (8453) | USDC | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` | 6 |
| Sepolia (11155111) | USDC | `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` | 6 |
| Base Sepolia (84532) | USDC | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` | 6 |

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| `POST /api/intents` | 10 intents per agent per minute |
| `POST /api/agents/register` | 5 registrations per wallet per minute |

## Retry Strategy

| HTTP Status | Action |
|-------------|--------|
| 400–499 | Do not retry. Fix the request. |
| 429 | Wait and retry after 60 seconds. |
| 500–599 | Retry with exponential backoff (1s, 2s, 4s, max 30s). |
| Network error | Retry up to 3 times with 2s delay. |
