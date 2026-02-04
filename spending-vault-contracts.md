# SpendingVault Contract System

Reference implementation for an upgradeable, policy-enforced spending vault using OpenZeppelin's Beacon Proxy pattern. Built for delegated agent wallets where an automated operator spends within limits set by a human admin.

## Table of Contents

- [Architecture](#architecture)
- [Contracts](#contracts)
- [Roles and Permissions](#roles-and-permissions)
- [Deployment](#deployment)
- [Vault Lifecycle](#vault-lifecycle)
- [Policy System](#policy-system)
- [Spending Limits](#spending-limits)
- [Cosigned Spends](#cosigned-spends)
- [Upgradeability](#upgradeability)
- [Security Model](#security-model)
- [Storage Layout](#storage-layout)
- [EIP-712 Signatures](#eip-712-signatures)
- [Deterministic Addressing](#deterministic-addressing)
- [Key Design Decisions](#key-design-decisions)

---

## Architecture

Three contracts deployed once, then an arbitrary number of proxy instances:

```
UpgradeableBeacon ──────► SpendingVault (implementation)
       ▲
       │ reads impl address
       │
VaultFactory
  │  new BeaconProxy{salt}(beacon, "")
  │  vault.initialize(admin, operator, limits...)
  ▼
BeaconProxy (Vault A)    ─┐
BeaconProxy (Vault B)     ├── all delegatecall to whatever impl the beacon points to
BeaconProxy (Vault C)    ─┘
```

Each `BeaconProxy` has its own storage (admin, operator, balances, limits) but delegates execution to the implementation contract that the `UpgradeableBeacon` points to. Upgrading the beacon upgrades every vault atomically.

### Why Beacon Proxy (not EIP-1167 Clones)

EIP-1167 minimal proxies are cheaper to deploy (~45 bytes each) but the implementation address is baked into the clone bytecode. You cannot upgrade existing clones. Beacon proxies cost more gas per deployment but all point to a shared beacon, so a single `beacon.upgradeTo(newImpl)` call upgrades every proxy simultaneously.

### Why not UUPS or Transparent Proxy

- **UUPS** requires upgrade logic in the implementation itself, meaning each proxy carries upgrade authority. We don't want vault operators to trigger upgrades.
- **Transparent Proxy** has the admin/proxy-admin complexity and per-proxy admin storage. Beacon is simpler: one beacon, one owner, all proxies follow.

---

## Contracts

### SpendingVault.sol (Implementation)

The logic contract. Never called directly — only via delegatecall from proxies.

**Dependencies:** OpenZeppelin `IERC20`, `SafeERC20`, `ECDSA`, `ReentrancyGuard`

**Constructor:** Sets `_initialized = true` to lock the implementation against direct initialization. This is critical — without it, an attacker could initialize the implementation and potentially cause confusion (though not steal funds from proxies).

**Key storage variables:**

| Variable | Type | Purpose |
|----------|------|---------|
| `admin` | `address` | Signs policy updates, can pause, emergency withdraw |
| `operator` | `address` | Calls spend functions within configured limits |
| `maxPerTx[token]` | `mapping` | Per-token per-transaction ceiling. 0 = unlimited |
| `dailyLimit[token]` | `mapping` | Per-token rolling 24h ceiling. 0 = unlimited |
| `_dailySpent[token]` | `mapping` | Accumulated spend in current epoch |
| `_spentEpoch[token]` | `mapping` | Epoch stamp for lazy daily reset |
| `allowedRecipients[addr]` | `mapping` | Recipient whitelist (empty = allow all) |
| `cosignRequired` | `bool` | If true, every spend needs admin EIP-712 cosign |
| `policyNonce` | `uint256` | Replay protection for policy updates |
| `spendNonce` | `uint256` | Replay protection for cosigned spends |
| `paused` | `bool` | Kill switch — blocks all spends |
| `DOMAIN_SEPARATOR` | `bytes32` | EIP-712 domain, computed at initialization |
| `__gap[50]` | `uint256[50]` | Reserved storage for future upgrades |

### VaultFactory.sol

Deploys new vault proxies and tracks them. Not itself upgradeable.

**Immutable state:**
- `beacon` — address of the `UpgradeableBeacon`

**Mutable state:**
- `owner` — can set deployer, transfer ownership
- `deployer` — authorized to call `createVault` (typically a server wallet)
- `vaults[walletId]` — maps salt to deployed proxy address

**Key functions:**
- `createVault(walletId, admin, operator, tokens, maxPerTxs, dailyLimits, cosignRequired)` — deploys a deterministic `BeaconProxy` using `walletId` as the CREATE2 salt, then calls `initialize()` on it
- `getVaultAddress(walletId)` — predicts the deterministic address before deployment
- `beaconImplementation()` — convenience view that reads the current impl from the beacon
- `setDeployer(addr)` — owner-only, authorizes a server wallet to deploy vaults
- `transferOwnership(newOwner)` — owner-only

### UpgradeableBeacon (OpenZeppelin)

Standard OZ contract. Stores the current implementation address. Owner can call `upgradeTo(newImpl)` — the new address must have code (no EOAs, no empty addresses).

---

## Roles and Permissions

### System-level roles (Factory + Beacon)

| Role | Held by | Can do |
|------|---------|--------|
| Factory owner | Hardware wallet (Ledger) | `setDeployer`, `transferOwnership` on factory |
| Beacon owner | Same hardware wallet | `upgradeTo(newImpl)` on beacon — upgrades all vaults |
| Factory deployer | Server wallet (Privy) | `createVault` — deploy new vault proxies |

### Per-vault roles

| Role | Held by | Can do |
|------|---------|--------|
| Admin | Hardware wallet (Ledger) | `pause`, `unpause`, `transferAdmin`, `changeOperator`, `setCosignRequired`, `emergencyWithdrawNative`, `emergencyWithdrawERC20`, sign policy updates, sign cosigned spends |
| Operator | Server wallet (Privy) | `spendNative`, `spendERC20`, `spendNativeCosigned`, `spendERC20Cosigned`, submit `updatePolicy` (with admin signature) |

The admin is the security backstop. The operator can only spend within configured limits. The admin can freeze the vault at any time, change the operator, or withdraw everything.

---

## Deployment

Three-step process, all in one transaction batch:

```
1. Deploy SpendingVault implementation
   - Constructor locks it (_initialized = true)
   - This contract is never called directly

2. Deploy UpgradeableBeacon(implementation, owner)
   - Points to the implementation
   - Owner = your hardware wallet
   - Validates implementation has code

3. Deploy VaultFactory(beacon, owner)
   - Points to the beacon
   - Owner = same hardware wallet
```

After deployment, call `factory.setDeployer(serverWalletAddress)` from the hardware wallet to authorize the server wallet to create vaults.

### Forge deployment script

```solidity
SpendingVault implementation = new SpendingVault();
UpgradeableBeacon beacon = new UpgradeableBeacon(address(implementation), vaultOwner);
VaultFactory factory = new VaultFactory(address(beacon), vaultOwner);
```

### TypeScript deployment (via Privy server wallet)

```typescript
// 1. Deploy implementation (no constructor args)
const implTx = await sendTx(walletId, { data: vaultArtifact.bytecode }, chainId);
const implAddress = (await waitForReceipt(implTx, chainId)).contractAddress;

// 2. Deploy beacon (constructor: address impl, address owner)
const beaconIface = new Interface(beaconArtifact.abi);
const beaconData = beaconArtifact.bytecode + beaconIface.encodeDeploy([implAddress, ownerAddress]).slice(2);
const beaconTx = await sendTx(walletId, { data: beaconData }, chainId);
const beaconAddress = (await waitForReceipt(beaconTx, chainId)).contractAddress;

// 3. Deploy factory (constructor: address beacon, address owner)
const factoryIface = new Interface(factoryArtifact.abi);
const factoryData = factoryArtifact.bytecode + factoryIface.encodeDeploy([beaconAddress, ownerAddress]).slice(2);
const factoryTx = await sendTx(walletId, { data: factoryData }, chainId);
const factoryAddress = (await waitForReceipt(factoryTx, chainId)).contractAddress;
```

---

## Vault Lifecycle

### Creation

```
API receives request to create agent wallet
  → vault-deployer.ts computes salt: keccak256(toUtf8Bytes(walletUUID))
  → encodes factory.createVault(salt, admin, operator, tokens, limits, cosign)
  → sends tx from Privy server wallet
  → factory deploys BeaconProxy with CREATE2
  → factory calls vault.initialize(...)
  → vault is live, can receive funds
```

### Initialization (one-time, called by factory)

`initialize()` sets:
- Admin and operator addresses
- Per-token spending limits (parallel arrays: tokens, maxPerTxs, dailyLimits)
- Cosign requirement flag
- EIP-712 domain separator (bound to chain ID and vault address)

Cannot be called twice — `_initialized` flag prevents re-initialization.

### Funding

Send ETH or ERC20 tokens directly to the vault proxy address. The vault has a `receive()` function for native ETH.

### Spending

Operator calls `spendNative(to, amount)` or `spendERC20(token, to, amount)`. Each call:
1. Checks `cosignRequired` — if true, reverts (must use cosigned variant)
2. Checks `paused` — if true, reverts
3. Lazy-resets daily counter if epoch rolled
4. Checks per-tx limit
5. Checks daily limit
6. Checks recipient whitelist (if configured)
7. Checks EOA-only restriction (if enabled)
8. Increments daily spent counter
9. Transfers funds
10. Emits event

### Pausing

Admin calls `pause()`. All spend functions revert with `IsPaused()`. Admin calls `unpause()` to resume. Policy updates and emergency withdrawals still work while paused.

### Emergency withdrawal

Admin calls `emergencyWithdrawNative(to, amount)` or `emergencyWithdrawERC20(token, to, amount)`. Bypasses all limits, whitelist, and pause state (but is protected by `nonReentrant`).

---

## Policy System

Policies are updated via `updatePolicy()` with an EIP-712 signature from the admin. This allows the operator (server) to submit policy changes on-chain while the admin only needs to sign off-chain.

### What a policy update sets

- **Token limits** — replaces the entire token configuration. Old tokens are cleared, new ones are set. This is a full replacement, not a delta.
- **Recipient whitelist** — replaces the entire whitelist. Empty array = allow all recipients.
- **EOA-only flag** — if true, rejects sends to contract addresses (checked via `to.code.length > 0`).

### What a policy update does NOT set

- Admin/operator addresses (separate functions: `transferAdmin`, `changeOperator`)
- Cosign requirement (separate function: `setCosignRequired`)
- Pause state (separate functions: `pause`, `unpause`)

### Policy nonce

Each policy update must include the current `policyNonce`. After a successful update, the nonce increments. This prevents replay attacks — a signed policy update can only be used once.

### EIP-712 signature

The admin signs a `PolicyUpdate` struct:

```
PolicyUpdate(
  bytes32 tokenConfigsHash,      // keccak256(abi.encodePacked(tokens, maxPerTxs, dailyLimits))
  bytes32 allowedRecipientsHash, // keccak256(abi.encodePacked(allowedRecipients))
  bool eoaOnly,
  uint256 nonce
)
```

The struct is hashed with the vault's domain separator (name: "Route SpendingVault", version: "1", chainId, verifyingContract: vault address).

---

## Spending Limits

### Per-token, dual-layer limits

Each token (identified by contract address, or `address(0)` for native ETH) has two independent limits:

- **`maxPerTx`** — maximum amount per single transaction. 0 = no per-tx limit.
- **`dailyLimit`** — maximum cumulative amount per 24-hour epoch. 0 = no daily limit.

Both must pass for a spend to succeed.

### Lazy epoch reset

Daily limits reset on a per-token basis using a lazy reset pattern:

```solidity
function _rollEpochIfNeeded(address token) private {
    uint256 epoch = block.timestamp / 1 days;
    if (_spentEpoch[token] < epoch) {
        _spentEpoch[token] = epoch;
        _dailySpent[token] = 0;
    }
}
```

This avoids iterating over all tokens at midnight. Each token's counter resets on its first spend in the new epoch.

### Unconfigured tokens

A token with `maxPerTx = 0` and `dailyLimit = 0` has no limits — the operator can spend any amount. This is the default for tokens not included in the initialization or policy update. If you want to block a token, don't hold it in the vault.

---

## Cosigned Spends

When `cosignRequired = true`, the operator must provide an admin EIP-712 signature with every spend.

### SpendApproval struct

```
SpendApproval(
  address token,   // token address (address(0) for ETH)
  address to,      // recipient
  uint256 amount,  // exact amount
  uint256 nonce    // must match vault's spendNonce
)
```

### Flow

1. Operator requests approval from admin (off-chain)
2. Admin signs `SpendApproval` struct with their key
3. Operator calls `spendNativeCosigned(to, amount, adminSig)` or `spendERC20Cosigned(token, to, amount, adminSig)`
4. Contract verifies signature, increments `spendNonce`, executes spend

### Nonce behavior

`spendNonce` is a single monotonic counter shared across all cosigned spends (both native and ERC20). It increments after each successful cosigned spend. Signatures for a given nonce can only be used once.

### Cosigned spends still respect limits

Even with a valid cosign, the spend must pass all configured limits (per-tx, daily, whitelist, EOA-only). Cosigning adds an authorization layer, it doesn't bypass policy.

---

## Upgradeability

### How it works

All vault proxies read their implementation address from the shared `UpgradeableBeacon`. The beacon owner (hardware wallet) calls:

```solidity
beacon.upgradeTo(address(newImplementation));
```

After this call, every existing proxy immediately delegatecalls to the new implementation. No per-vault migration, no state changes, no downtime.

### Storage gap

The implementation reserves 50 storage slots at the end:

```solidity
uint256[50] private __gap;
```

When adding new storage variables in V2, reduce the gap accordingly:

```solidity
// V2 adds a new variable
address public newVariable;
uint256[49] private __gap; // was 50, now 49
```

### Upgrade safety rules

1. **Never change the order of existing storage variables.** Proxy storage is positional — reordering corrupts all existing vaults.
2. **Only append new variables before `__gap`.** Reduce the gap size by the number of new slots.
3. **Never remove or change the type of existing variables.** If a variable is obsolete, leave it in place.
4. **The constructor should always set `_initialized = true`.** This locks the new implementation against direct initialization.
5. **Test the upgrade path.** Deploy V1, create vaults, upgrade to V2, verify old state is intact and new functionality works.

### Writing a V2

```solidity
contract SpendingVaultV2 is SpendingVault {
    // New storage goes here, before the gap
    // The gap shrinks to accommodate

    function newFeature() external { ... }

    // Override existing functions if needed
    // Existing storage layout is preserved via inheritance
}
```

### The factory is NOT upgradeable

`VaultFactory` is a plain contract, not a proxy. If you need to change factory logic (e.g., new `createVault` parameters), deploy a new factory pointing to the same beacon. Old vaults continue working — they only depend on the beacon, not the factory.

---

## Security Model

### Threat: compromised operator

The operator (server wallet) can only spend within configured limits. Worst case: operator drains up to `dailyLimit` per day until the admin notices and calls `pause()` or `changeOperator()`.

Mitigation levers:
- Set conservative per-tx and daily limits
- Enable `cosignRequired` for high-value vaults
- Enable `eoaOnly` to prevent operator from sending to contracts (e.g., to a swap router to circumvent token restrictions)
- Set a recipient whitelist

### Threat: compromised admin key

The admin can withdraw everything via `emergencyWithdraw*`. If the admin key is compromised, all funds in the vault are at risk.

Mitigation: use a hardware wallet (Ledger) for the admin key. The admin key never touches a server.

### Threat: chain fork / replay

EIP-712 domain separator includes `chainId` and `verifyingContract`. If the chain forks, the domain separator is recomputed dynamically:

```solidity
function _domainSeparator() private view returns (bytes32) {
    if (block.chainid == _deployedChainId) {
        return DOMAIN_SEPARATOR; // cached
    }
    return keccak256(...); // recompute with current chainId
}
```

Signatures from the original chain are invalid on the fork and vice versa.

### Threat: re-initialization

The implementation constructor sets `_initialized = true`. Proxies set it in `initialize()`. Any attempt to call `initialize()` again reverts with `AlreadyInitialized()`.

### Threat: reentrancy

All spend and emergency withdraw functions use OpenZeppelin's `nonReentrant` modifier. Native ETH transfers use low-level `call` (not `transfer`/`send`) to avoid gas limit issues, but reentrancy is blocked at the modifier level.

### Threat: malicious upgrade

Only the beacon owner (hardware wallet) can upgrade. The `UpgradeableBeacon` validates that the new implementation has code (`code.length > 0`). There is no timelock — the owner can upgrade instantly. Add a timelock contract as the beacon owner if delayed upgrades are desired.

---

## Storage Layout

Order matters for proxy compatibility. This is the exact slot order:

```
slot 0:  ReentrancyGuard._status (inherited, uint256)
slot 1:  admin (address)
slot 2:  operator (address)
slot 3:  maxPerTx (mapping)
slot 4:  dailyLimit (mapping)
slot 5:  _dailySpent (mapping)
slot 6:  _spentEpoch (mapping)
slot 7:  _configuredTokens (address[])
slot 8:  allowedRecipients (mapping)
slot 9:  allowedRecipientsCount (uint256)
slot 10: policyNonce (uint256)
slot 11: paused | eoaOnly | cosignRequired (packed bools + ...)
slot 12: spendNonce (uint256)
slot 13: _initialized | _deployedChainId (packed bool + uint256)
         (note: _initialized is bool, _deployedChainId starts in same slot)
slot 14: DOMAIN_SEPARATOR (bytes32)
slot 15: _recipientList (address[])
slots 16-65: __gap[50]
```

Note: Solidity packs bools and small types. Exact packing depends on declaration order. Use `forge inspect SpendingVault storage-layout` to verify.

---

## EIP-712 Signatures

### Domain

```
EIP712Domain(
  string name,              // "Route SpendingVault"
  string version,           // "1"
  uint256 chainId,          // block.chainid at initialization
  address verifyingContract // vault proxy address
)
```

### PolicyUpdate type

```
PolicyUpdate(
  bytes32 tokenConfigsHash,
  bytes32 allowedRecipientsHash,
  bool eoaOnly,
  uint256 nonce
)
```

Where:
- `tokenConfigsHash = keccak256(abi.encodePacked(tokens, maxPerTxs, dailyLimits))`
- `allowedRecipientsHash = keccak256(abi.encodePacked(allowedRecipients))`

### SpendApproval type

```
SpendApproval(
  address token,
  address to,
  uint256 amount,
  uint256 nonce
)
```

### Signing (ethers.js example)

```typescript
const domain = {
  name: "Route SpendingVault",
  version: "1",
  chainId: 8453,
  verifyingContract: vaultAddress,
};

const types = {
  PolicyUpdate: [
    { name: "tokenConfigsHash", type: "bytes32" },
    { name: "allowedRecipientsHash", type: "bytes32" },
    { name: "eoaOnly", type: "bool" },
    { name: "nonce", type: "uint256" },
  ],
};

const value = {
  tokenConfigsHash: keccak256(encodePacked(tokens, maxPerTxs, dailyLimits)),
  allowedRecipientsHash: keccak256(encodePacked(allowedRecipients)),
  eoaOnly: false,
  nonce: currentPolicyNonce,
};

const signature = await adminSigner._signTypedData(domain, types, value);
```

---

## Deterministic Addressing

Vault addresses are predictable before deployment using CREATE2:

```
address = keccak256(0xff ++ factoryAddress ++ salt ++ keccak256(creationCode))[12:]
```

Where:
- `salt` = `walletId` (bytes32, typically `keccak256(toUtf8Bytes(databaseUUID))`)
- `creationCode` = `type(BeaconProxy).creationCode ++ abi.encode(beacon, "")` — constant for all vaults since all use the same beacon and empty init data

The factory exposes `getVaultAddress(walletId)` for on-chain prediction. For off-chain prediction, replicate the CREATE2 formula in your language of choice.

---

## Key Design Decisions

### Initialize pattern instead of constructor

Proxies cannot use constructors (the constructor runs in the implementation's context, not the proxy's). The `initialize()` function serves as the constructor, protected by the `_initialized` flag.

### Empty init data in BeaconProxy constructor

```solidity
vault = address(new BeaconProxy{ salt: walletId }(beacon, ""));
```

The second argument to `BeaconProxy` is optional init data that would be delegatecalled during construction. We pass empty bytes and call `initialize()` separately. This keeps the creation code identical for all vaults (the beacon address is the same), which makes CREATE2 address prediction straightforward.

### address(0) as native ETH sentinel

Using `address(0)` to represent native ETH in limit mappings avoids a separate storage layout for ETH vs ERC20. The same `maxPerTx`, `dailyLimit`, `_dailySpent`, and `_spentEpoch` mappings work for both.

### Lazy daily reset

Instead of a cron job or timestamp-based expiry per spend, the contract uses epoch-based lazy resets. `_currentEpoch() = block.timestamp / 1 days`. On each spend, if the token's epoch stamp is stale, the counter resets. This costs ~2 extra SLOADs per spend but avoids any off-chain maintenance.

### Recipient whitelist as mapping + array

The whitelist uses a `mapping(address => bool)` for O(1) lookups during spends and a parallel `address[]` array for enumeration during policy updates (to clear old entries). The array is bounded by `MAX_RECIPIENTS = 100`.

### Custom errors instead of require strings

All reverts use custom errors (e.g., `error ExceedsPerTxLimit()`). This saves gas compared to `require(cond, "string")` and provides better ABI-level error identification for off-chain consumers.

### No OpenZeppelin Initializable

The vault uses a simple `bool _initialized` flag instead of OZ's `Initializable` base contract. This avoids an extra inheritance chain and storage slot, and the behavior is identical for a single-step initialization.

### Factory is not upgradeable

The factory itself is a plain contract. If factory logic needs to change (e.g., new `createVault` parameters), deploy a new factory that points to the same beacon. Existing vaults are unaffected — they depend on the beacon, not the factory. The old factory can be abandoned.

### Two-role factory (owner + deployer)

The factory has an `owner` (hardware wallet, high-trust) and a `deployer` (server wallet, lower-trust). The deployer can only create vaults, not change factory settings. This allows automated vault creation without giving the server wallet full factory control.
