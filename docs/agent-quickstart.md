# Agent Quickstart — Create a Payment Intent

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

## 2. Build the AgentAuth Header

Every request to the API requires an `Authorization` header:

```
Authorization: AgentAuth <timestamp>.<bodyHash>.<signature>
```

| Part        | How to compute                                                                 |
|-------------|--------------------------------------------------------------------------------|
| `timestamp` | Current Unix epoch in **seconds** (must be within 5 min of server time)        |
| `bodyHash`  | `keccak256` of the raw JSON body string, as hex. Use `"0x"` for GET requests   |
| `signature` | EIP-191 `personal_sign` of the string `"<timestamp>.<bodyHash>"` using `privateKey` from the credential file |

## 3. Send an Intent

**`POST https://www.agentintents.io/api/intents`**

```json
{
  "agentId": "my-agent",
  "agentName": "My Agent",
  "details": {
    "type": "transfer",
    "token": "USDC",
    "amount": "1.00",
    "recipient": "0xRecipientAddress",
    "chainId": 8453,
    "memo": "Reason for payment"
  },
  "urgency": "normal",
  "expiresInMinutes": 60
}
```

The response includes a `paymentUrl` — share it with the human so they can review and sign.

## 4. Poll for Completion

**`GET https://www.agentintents.io/api/intents/<intent-id>`**

Poll until `status` is `confirmed`, `rejected`, `failed`, or `expired`.

---

## Complete Node.js Example

```js
import { keccak256, toHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";

// 1. Load credential
const credential = JSON.parse(fs.readFileSync("agent-credential.json", "utf-8"));
const account = privateKeyToAccount(credential.privateKey);

// 2. Build body
const body = JSON.stringify({
  agentId: "my-agent",
  agentName: credential.label,
  details: {
    type: "transfer",
    token: "USDC",
    amount: "1.00",
    recipient: "0xRecipientAddress",
    chainId: 8453,
    memo: "Reason for payment",
  },
  urgency: "normal",
  expiresInMinutes: 60,
});

// 3. Sign
const timestamp = Math.floor(Date.now() / 1000).toString();
const bodyHash = keccak256(toHex(body));
const signature = await account.signMessage({ message: `${timestamp}.${bodyHash}` });

// 4. Send
const res = await fetch("https://www.agentintents.io/api/intents", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `AgentAuth ${timestamp}.${bodyHash}.${signature}`,
  },
  body,
});

const { intent, paymentUrl } = await res.json();
console.log("Share this link with the human:", paymentUrl);

// 5. Poll
let status = "pending";
while (!["confirmed", "rejected", "failed", "expired"].includes(status)) {
  await new Promise((r) => setTimeout(r, 30_000));
  const poll = await fetch(`https://www.agentintents.io/api/intents/${intent.id}`);
  ({ intent: { status } } = await poll.json());
}
console.log("Final status:", status);
```

## Complete Python Example

```python
import json, time, requests
from eth_account import Account
from eth_account.messages import encode_defunct
from eth_hash.auto import keccak

# 1. Load credential
with open("agent-credential.json") as f:
    cred = json.load(f)

# 2. Build body
body = json.dumps({
    "agentId": "my-agent",
    "agentName": cred["label"],
    "details": {
        "type": "transfer",
        "token": "USDC",
        "amount": "1.00",
        "recipient": "0xRecipientAddress",
        "chainId": 8453,
        "memo": "Reason for payment",
    },
    "urgency": "normal",
    "expiresInMinutes": 60,
}, separators=(",", ":"))  # compact JSON, no spaces

# 3. Sign
timestamp = str(int(time.time()))
body_hash = "0x" + keccak(body.encode()).hex()
message = f"{timestamp}.{body_hash}"
sig = Account.sign_message(encode_defunct(text=message), cred["privateKey"])

# 4. Send
r = requests.post(
    "https://www.agentintents.io/api/intents",
    headers={
        "Content-Type": "application/json",
        "Authorization": f"AgentAuth {timestamp}.{body_hash}.{sig.signature.hex()}",
    },
    data=body,
)
data = r.json()
print("Share this link:", data["paymentUrl"])

# 5. Poll
intent_id = data["intent"]["id"]
status = "pending"
while status not in ("confirmed", "rejected", "failed", "expired"):
    time.sleep(30)
    status = requests.get(
        f"https://www.agentintents.io/api/intents/{intent_id}"
    ).json()["intent"]["status"]
print("Final status:", status)
```

## Supported Chains

| Chain ID | Name         | Token | Notes    |
|----------|--------------|-------|----------|
| 8453     | Base         | USDC  | Mainnet  |
| 84532    | Base Sepolia | USDC  | Testnet  |
| 11155111 | Sepolia      | USDC  | Testnet  |
