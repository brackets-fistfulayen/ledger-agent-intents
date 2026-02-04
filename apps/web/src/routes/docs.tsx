import { createFileRoute, Link } from "@tanstack/react-router";
import { SUPPORTED_CHAINS, SUPPORTED_TOKENS } from "@agent-intents/shared";

export const Route = createFileRoute("/docs")({
	component: DocsPage,
	head: () => ({
		meta: [
			{ title: "API Documentation | Agent Intents" },
			{
				name: "description",
				content: "API documentation for AI agents to submit transaction intents for Ledger hardware signing.",
			},
		],
	}),
});

// =============================================================================
// Code Block Component
// =============================================================================

function CodeBlock({
	children,
	language = "json",
	title,
}: {
	children: string;
	language?: string;
	title?: string;
}) {
	return (
		<div className="rounded-md overflow-hidden border border-muted bg-surface">
			{title && (
				<div className="px-16 py-8 bg-muted border-b border-muted flex items-center justify-between">
					<span className="body-3-semi-bold text-muted">{title}</span>
					<span className="body-4 text-muted-subtle">{language}</span>
				</div>
			)}
			<pre className="p-16 overflow-x-auto body-2">
				<code className="text-base font-mono">{children}</code>
			</pre>
		</div>
	);
}

// =============================================================================
// Section Components
// =============================================================================

function Section({
	id,
	title,
	children,
}: {
	id: string;
	title: string;
	children: React.ReactNode;
}) {
	return (
		<section id={id} className="scroll-mt-24">
			<h2 className="heading-4-semi-bold text-base mb-16 flex items-center gap-8">
				<span className="text-accent">#</span>
				{title}
			</h2>
			<div className="space-y-16">{children}</div>
		</section>
	);
}

function Subsection({
	id,
	title,
	children,
}: {
	id: string;
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div id={id} className="scroll-mt-24">
			<h3 className="heading-5 text-base mb-12">{title}</h3>
			<div className="space-y-12">{children}</div>
		</div>
	);
}

function Endpoint({
	method,
	path,
	description,
}: {
	method: "GET" | "POST" | "PATCH" | "DELETE";
	path: string;
	description: string;
}) {
	const methodColors = {
		GET: "bg-success text-success",
		POST: "bg-interactive text-interactive",
		PATCH: "bg-warning text-warning",
		DELETE: "bg-error text-error",
	};

	return (
		<div className="flex items-start gap-12 p-16 rounded-md bg-surface border border-muted">
			<span
				className={`px-8 py-4 rounded-xs body-3-semi-bold ${methodColors[method]}`}
			>
				{method}
			</span>
			<div className="flex-1 min-w-0">
				<code className="body-2 text-base font-mono">{path}</code>
				<p className="body-2 text-muted mt-4">{description}</p>
			</div>
		</div>
	);
}

function Param({
	name,
	type,
	required = false,
	description,
}: {
	name: string;
	type: string;
	required?: boolean;
	description: string;
}) {
	return (
		<div className="flex items-start gap-8 py-8 border-b border-muted last:border-0">
			<code className="body-2 text-accent font-mono whitespace-nowrap">
				{name}
			</code>
			<span className="body-4 text-muted-subtle bg-muted px-6 py-2 rounded-xs">
				{type}
			</span>
			{required && (
				<span className="body-4 text-error bg-error px-6 py-2 rounded-xs">
					required
				</span>
			)}
			<span className="body-2 text-muted flex-1">{description}</span>
		</div>
	);
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
	return (
		<a
			href={href}
			className="block py-6 px-12 body-2 text-muted hover:text-base hover:bg-muted-transparent rounded-sm transition-colors"
		>
			{children}
		</a>
	);
}

// =============================================================================
// Main Documentation Page
// =============================================================================

function DocsPage() {
	return (
		<div className="flex gap-32 max-w-7xl mx-auto">
			{/* Sidebar Navigation */}
			<nav className="hidden lg:block w-[220px] flex-shrink-0 sticky top-24 h-fit">
				<div className="space-y-24">
					<div>
						<h4 className="body-4-semi-bold text-muted-subtle uppercase tracking-wider mb-8 px-12">
							Getting Started
						</h4>
						<NavLink href="#overview">Overview</NavLink>
						<NavLink href="#quick-start">Quick Start</NavLink>
						<NavLink href="#authentication">Authentication</NavLink>
					</div>
					<div>
						<h4 className="body-4-semi-bold text-muted-subtle uppercase tracking-wider mb-8 px-12">
							API Reference
						</h4>
						<NavLink href="#create-intent">Create Intent</NavLink>
						<NavLink href="#get-intent">Get Intent Status</NavLink>
						<NavLink href="#list-intents">List Intents</NavLink>
						<NavLink href="#update-status">Update Status</NavLink>
					</div>
					<div>
						<h4 className="body-4-semi-bold text-muted-subtle uppercase tracking-wider mb-8 px-12">
							CLI Skill
						</h4>
						<NavLink href="#cli-install">Installation</NavLink>
						<NavLink href="#cli-commands">Commands</NavLink>
						<NavLink href="#cli-examples">Examples</NavLink>
					</div>
					<div>
						<h4 className="body-4-semi-bold text-muted-subtle uppercase tracking-wider mb-8 px-12">
							Reference
						</h4>
						<NavLink href="#types">Types & Schemas</NavLink>
						<NavLink href="#chains">Supported Chains</NavLink>
						<NavLink href="#tokens">Supported Tokens</NavLink>
						<NavLink href="#errors">Error Handling</NavLink>
					</div>
				</div>
			</nav>

			{/* Main Content */}
			<main className="flex-1 min-w-0 space-y-48 pb-64">
				{/* Header */}
				<div className="space-y-16">
					<div className="flex items-center gap-12">
						<Link to="/" className="body-2 text-muted hover:text-base transition-colors">
							← Back to App
						</Link>
					</div>
					<div>
						<h1 className="heading-2-semi-bold text-base">Agent Intents API</h1>
						<p className="body-1 text-muted mt-8">
							Documentation for AI agents to submit transaction intents for Ledger hardware signing.
						</p>
					</div>
					<div className="flex items-center gap-16 p-16 rounded-md bg-accent border border-accent">
						<span className="text-2xl">🤖</span>
						<div>
							<p className="body-2-semi-bold text-accent">Built for Agents</p>
							<p className="body-2 text-muted">
								This API enables AI agents to propose transactions. Humans review and sign on Ledger hardware.
							</p>
						</div>
					</div>
				</div>

				{/* Overview */}
				<Section id="overview" title="Overview">
					<p className="body-1 text-base">
						The Agent Intents API allows AI agents to submit transaction intents that will be queued for human review and hardware signing. This creates a secure bridge where agents can propose transactions but never access private keys.
					</p>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-16">
						<div className="p-16 rounded-md bg-surface border border-muted">
							<div className="text-2xl mb-8">📝</div>
							<h4 className="body-1-semi-bold text-base">1. Agent Proposes</h4>
							<p className="body-2 text-muted mt-4">
								Submit a structured intent via API or CLI. Get an intent ID for tracking.
							</p>
						</div>
						<div className="p-16 rounded-md bg-surface border border-muted">
							<div className="text-2xl mb-8">👀</div>
							<h4 className="body-1-semi-bold text-base">2. Human Reviews</h4>
							<p className="body-2 text-muted mt-4">
								User sees the intent in the web app with full transaction details.
							</p>
						</div>
						<div className="p-16 rounded-md bg-surface border border-muted">
							<div className="text-2xl mb-8">🔐</div>
							<h4 className="body-1-semi-bold text-base">3. Ledger Signs</h4>
							<p className="body-2 text-muted mt-4">
								Transaction is signed on Ledger device and broadcast to the blockchain.
							</p>
						</div>
					</div>

					<CodeBlock language="text" title="Architecture">
{`┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   AI Agent      │────▶│   Intent Queue   │────▶│  Ledger Signer  │
│   (You)         │     │   (This API)     │     │  (Human + HW)   │
│                 │     │                  │     │                 │
│ • POST intents  │     │ • Stores intents │     │ • Reviews       │
│ • Poll status   │     │ • Audit trail    │     │ • Signs on HW   │
│ • NO key access │     │ • Returns txHash │     │ • Broadcasts    │
└─────────────────┘     └──────────────────┘     └─────────────────┘`}
					</CodeBlock>
				</Section>

				{/* Quick Start */}
				<Section id="quick-start" title="Quick Start">
					<p className="body-1 text-base">
						Create your first intent in seconds. No API key required for the hackathon demo.
					</p>

					<Subsection id="quick-start-curl" title="Using cURL">
						<CodeBlock language="bash" title="Create an Intent">
{`curl -X POST https://your-api-url.com/api/intents \\
  -H "Content-Type: application/json" \\
  -d '{
    "agentId": "your-agent-id",
    "agentName": "Your Agent Name",
    "userId": "demo-user",
    "details": {
      "type": "transfer",
      "token": "USDC",
      "amount": "50",
      "recipient": "0x1234567890abcdef1234567890abcdef12345678",
      "chainId": 11155111,
      "memo": "Payment for services"
    }
  }'`}
						</CodeBlock>
					</Subsection>

					<Subsection id="quick-start-response" title="Response">
						<CodeBlock language="json" title="Success Response">
{`{
  "success": true,
  "intent": {
    "id": "int_1707048000_abc12345",
    "userId": "demo-user",
    "agentId": "your-agent-id",
    "agentName": "Your Agent Name",
    "status": "pending",
    "details": {
      "type": "transfer",
      "token": "USDC",
      "amount": "50",
      "recipient": "0x1234567890abcdef1234567890abcdef12345678",
      "chainId": 11155111,
      "memo": "Payment for services"
    },
    "urgency": "normal",
    "createdAt": "2026-02-04T10:00:00.000Z",
    "expiresAt": "2026-02-05T10:00:00.000Z",
    "statusHistory": [
      { "status": "pending", "timestamp": "2026-02-04T10:00:00.000Z" }
    ]
  }
}`}
						</CodeBlock>
					</Subsection>
				</Section>

				{/* Authentication */}
				<Section id="authentication" title="Authentication">
					<div className="p-16 rounded-md bg-interactive border border-interactive">
						<p className="body-2 text-interactive">
							<strong>Hackathon Mode:</strong> No authentication required. Pass a <code className="bg-interactive px-4 py-2 rounded-xs">userId</code> in the request body to identify the user.
						</p>
					</div>
					<p className="body-1 text-base">
						In production, agents would authenticate via API keys or OAuth. For the hackathon, simply include your <code className="bg-muted px-4 py-2 rounded-xs text-accent">userId</code> in requests.
					</p>
				</Section>

				{/* API Reference: Create Intent */}
				<Section id="create-intent" title="Create Intent">
					<Endpoint
						method="POST"
						path="/api/intents"
						description="Submit a new transaction intent for human review and signing."
					/>

					<Subsection id="create-intent-params" title="Request Body">
						<div className="rounded-lg border border-neutral-800 p-16 bg-neutral-900/30">
							<Param
								name="agentId"
								type="string"
								required
								description="Unique identifier for your agent (e.g., 'clouseau', 'research-bot')"
							/>
							<Param
								name="agentName"
								type="string"
								required
								description="Human-readable display name (e.g., 'Inspector Clouseau')"
							/>
							<Param
								name="userId"
								type="string"
								required
								description="The user ID whose intents this is for"
							/>
							<Param
								name="details"
								type="TransferIntent"
								required
								description="The transaction details (see schema below)"
							/>
							<Param
								name="urgency"
								type="string"
								description="Priority level: 'low' | 'normal' | 'high' | 'critical' (default: 'normal')"
							/>
							<Param
								name="expiresInMinutes"
								type="number"
								description="Minutes until intent expires (default: 1440 = 24 hours)"
							/>
						</div>
					</Subsection>

					<Subsection id="transfer-intent-schema" title="TransferIntent Schema">
						<div className="rounded-lg border border-neutral-800 p-16 bg-neutral-900/30">
							<Param
								name="type"
								type="string"
								required
								description="Must be 'transfer'"
							/>
							<Param
								name="token"
								type="string"
								required
								description="Token symbol: 'USDC', 'ETH', etc."
							/>
							<Param
								name="amount"
								type="string"
								required
								description="Human-readable amount (e.g., '50', '0.5')"
							/>
							<Param
								name="recipient"
								type="string"
								required
								description="Destination address (0x...)"
							/>
							<Param
								name="chainId"
								type="number"
								required
								description="Chain ID (11155111 for Sepolia, 84532 for Base Sepolia)"
							/>
							<Param
								name="memo"
								type="string"
								description="Human-readable reason for the transaction"
							/>
							<Param
								name="tokenAddress"
								type="string"
								description="ERC-20 contract address (auto-filled for known tokens)"
							/>
						</div>
					</Subsection>

					<Subsection id="create-intent-example" title="Full Example">
						<CodeBlock language="json" title="Request Body">
{`{
  "agentId": "podcast-agent",
  "agentName": "Podcast Payment Bot",
  "userId": "ian",
  "urgency": "normal",
  "expiresInMinutes": 60,
  "details": {
    "type": "transfer",
    "token": "USDC",
    "amount": "200",
    "recipient": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    "chainId": 11155111,
    "memo": "Payment to Seth for podcast intro music"
  }
}`}
						</CodeBlock>
					</Subsection>
				</Section>

				{/* API Reference: Get Intent */}
				<Section id="get-intent" title="Get Intent Status">
					<Endpoint
						method="GET"
						path="/api/intents/:id"
						description="Retrieve the current status and details of an intent. Use this to poll for status updates."
					/>

					<Subsection id="get-intent-usage" title="Usage">
						<CodeBlock language="bash" title="Poll Intent Status">
{`curl https://your-api-url.com/api/intents/int_1707048000_abc12345`}
						</CodeBlock>
					</Subsection>

					<Subsection id="intent-status-lifecycle" title="Status Lifecycle">
						<div className="grid grid-cols-2 md:grid-cols-4 gap-8">
							{[
								{ status: "pending", icon: "⏳", desc: "Awaiting human review" },
								{ status: "approved", icon: "✓", desc: "Human approved, ready to sign" },
								{ status: "signed", icon: "📝", desc: "Signed, broadcasting tx" },
								{ status: "confirmed", icon: "✅", desc: "Transaction confirmed" },
								{ status: "rejected", icon: "✗", desc: "Human rejected" },
								{ status: "failed", icon: "❌", desc: "Transaction failed" },
								{ status: "expired", icon: "⌛", desc: "Intent expired" },
							].map(({ status, icon, desc }) => (
								<div
									key={status}
									className="p-12 rounded-md bg-surface border border-muted text-center"
								>
									<div className="text-xl mb-4">{icon}</div>
									<div className="body-2-semi-bold text-base">{status}</div>
									<div className="body-3 text-muted-subtle mt-2">{desc}</div>
								</div>
							))}
						</div>
					</Subsection>

					<Subsection id="polling-strategy" title="Polling Strategy">
						<div className="p-16 rounded-md bg-surface border border-muted">
							<p className="body-2 text-base mb-12">
								Recommended polling intervals based on urgency:
							</p>
							<div className="space-y-8">
								<div className="flex items-center gap-12">
									<code className="text-error bg-muted px-8 py-4 rounded-xs body-3">critical</code>
									<span className="text-muted body-2">→ Every 5 seconds</span>
								</div>
								<div className="flex items-center gap-12">
									<code className="text-warning bg-muted px-8 py-4 rounded-xs body-3">high</code>
									<span className="text-muted body-2">→ Every 15 seconds</span>
								</div>
								<div className="flex items-center gap-12">
									<code className="text-interactive bg-muted px-8 py-4 rounded-xs body-3">normal</code>
									<span className="text-muted body-2">→ Every 30 seconds</span>
								</div>
								<div className="flex items-center gap-12">
									<code className="text-muted bg-muted px-8 py-4 rounded-xs body-3">low</code>
									<span className="text-muted body-2">→ Every 60 seconds</span>
								</div>
							</div>
						</div>
					</Subsection>
				</Section>

				{/* API Reference: List Intents */}
				<Section id="list-intents" title="List Intents">
					<Endpoint
						method="GET"
						path="/api/users/:userId/intents"
						description="List all intents for a specific user, optionally filtered by status."
					/>

					<Subsection id="list-intents-params" title="Query Parameters">
						<div className="rounded-lg border border-neutral-800 p-16 bg-neutral-900/30">
							<Param
								name="status"
								type="string"
								description="Filter by status: 'pending' | 'approved' | 'signed' | 'confirmed' | 'rejected' | 'failed' | 'expired'"
							/>
						</div>
					</Subsection>

					<Subsection id="list-intents-example" title="Example">
						<CodeBlock language="bash" title="List Pending Intents">
{`curl "https://your-api-url.com/api/users/ian/intents?status=pending"`}
						</CodeBlock>
					</Subsection>
				</Section>

				{/* API Reference: Update Status */}
				<Section id="update-status" title="Update Status">
					<Endpoint
						method="PATCH"
						path="/api/intents/:id/status"
						description="Update the status of an intent (typically called by the signing app, not agents)."
					/>
					<div className="p-16 rounded-md bg-warning border border-warning">
						<p className="body-2 text-warning">
							<strong>Note:</strong> This endpoint is primarily for the signing application. Agents should only poll status, not update it.
						</p>
					</div>
				</Section>

				{/* CLI Skill */}
				<Section id="cli-install" title="CLI Skill Installation">
					<p className="body-1 text-base">
						The <code className="bg-muted px-4 py-2 rounded-xs text-accent">ledger-intent</code> CLI provides a convenient way to interact with the API.
					</p>

					<Subsection id="cli-env" title="Environment Variables">
						<div className="rounded-lg border border-neutral-800 p-16 bg-neutral-900/30">
							<Param
								name="INTENT_API_URL"
								type="string"
								description="Backend API URL (default: http://localhost:3001)"
							/>
							<Param
								name="INTENT_AGENT_ID"
								type="string"
								description="Your agent's unique identifier (default: clouseau)"
							/>
							<Param
								name="INTENT_AGENT_NAME"
								type="string"
								description="Your agent's display name (default: Inspector Clouseau)"
							/>
							<Param
								name="INTENT_USER_ID"
								type="string"
								description="The user ID for intents (default: demo-user)"
							/>
						</div>
					</Subsection>
				</Section>

				<Section id="cli-commands" title="CLI Commands">
					<Subsection id="cli-send" title="send">
						<CodeBlock language="bash" title="Send Tokens">
{`ledger-intent send <amount> <token> to <address> [for "reason"] [--chain <id>] [--urgency <level>]

# Parameters:
#   amount    - Amount to send (e.g., "50", "0.5")
#   token     - Token symbol (USDC, ETH, etc.)
#   address   - Recipient address (0x...)
#   reason    - Optional memo explaining the transaction
#   --chain   - Chain ID (default: 1 for Ethereum)
#   --urgency - Priority: low, normal, high, critical`}
						</CodeBlock>
					</Subsection>

					<Subsection id="cli-status" title="status">
						<CodeBlock language="bash" title="Check Status">
{`ledger-intent status <intent-id>

# Returns current status, transaction hash (if signed), and explorer link`}
						</CodeBlock>
					</Subsection>

					<Subsection id="cli-list" title="list">
						<CodeBlock language="bash" title="List Intents">
{`ledger-intent list [--status <status>]

# Lists all intents, optionally filtered by status`}
						</CodeBlock>
					</Subsection>
				</Section>

				<Section id="cli-examples" title="CLI Examples">
					<div className="space-y-16">
						<CodeBlock language="bash" title="Pay for Podcast Work">
{`ledger-intent send 50 USDC to 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 for "podcast intro music"`}
						</CodeBlock>

						<CodeBlock language="bash" title="Urgent Payment on Base">
{`ledger-intent send 100 USDC to 0xabc...def for "time-sensitive invoice" --chain 8453 --urgency high`}
						</CodeBlock>

						<CodeBlock language="bash" title="Check Pending Intents">
{`ledger-intent list --status pending`}
						</CodeBlock>

						<CodeBlock language="bash" title="Poll Until Confirmed">
{`# Bash loop to poll until confirmed
INTENT_ID="int_1707048000_abc12345"
while true; do
  STATUS=$(ledger-intent status $INTENT_ID | grep "Status:" | cut -d' ' -f2)
  echo "Current status: $STATUS"
  if [ "$STATUS" = "confirmed" ] || [ "$STATUS" = "rejected" ]; then
    break
  fi
  sleep 30
done`}
						</CodeBlock>
					</div>
				</Section>

				{/* Types Reference */}
				<Section id="types" title="Types & Schemas">
					<Subsection id="intent-type" title="Intent Object">
						<CodeBlock language="typescript" title="Intent Type">
{`interface Intent {
  id: string;                    // Unique intent ID (e.g., "int_1707048000_abc12345")
  userId: string;                // User who will sign
  agentId: string;               // Agent that created the intent
  agentName: string;             // Agent display name
  
  details: TransferIntent;       // Transaction details
  urgency: IntentUrgency;        // "low" | "normal" | "high" | "critical"
  status: IntentStatus;          // Current status in lifecycle
  
  // Timestamps (ISO 8601)
  createdAt: string;
  expiresAt?: string;
  reviewedAt?: string;
  signedAt?: string;
  confirmedAt?: string;
  
  // Transaction result
  txHash?: string;               // Transaction hash after signing
  txUrl?: string;                // Block explorer link
  
  // Audit trail
  statusHistory: Array<{
    status: IntentStatus;
    timestamp: string;
    note?: string;
  }>;
}`}
						</CodeBlock>
					</Subsection>

					<Subsection id="transfer-intent-type" title="TransferIntent Object">
						<CodeBlock language="typescript" title="TransferIntent Type">
{`interface TransferIntent {
  type: "transfer";              // Intent type
  token: string;                 // Token symbol (e.g., "USDC", "ETH")
  tokenAddress?: string;         // ERC-20 contract address
  amount: string;                // Human-readable amount
  amountWei?: string;            // Wei amount for precision
  recipient: string;             // Destination address
  recipientEns?: string;         // ENS name if resolved
  chainId: number;               // Chain ID (e.g., 11155111)
  memo?: string;                 // Human-readable reason
}`}
						</CodeBlock>
					</Subsection>

					<Subsection id="status-enum" title="IntentStatus Enum">
						<CodeBlock language="typescript" title="IntentStatus Type">
{`type IntentStatus =
  | "pending"     // Created by agent, awaiting human review
  | "approved"    // Human approved, ready to sign
  | "rejected"    // Human rejected
  | "signed"      // Signed on device, broadcasting
  | "confirmed"   // Transaction confirmed on-chain
  | "failed"      // Transaction failed
  | "expired";    // Intent expired without action`}
						</CodeBlock>
					</Subsection>
				</Section>

				{/* Supported Chains */}
				<Section id="chains" title="Supported Chains">
					<p className="body-1 text-base mb-16">
						Currently supporting testnet chains for the hackathon:
					</p>
					<div className="rounded-md border border-muted overflow-hidden">
						<table className="w-full body-2">
							<thead className="bg-muted">
								<tr>
									<th className="text-left p-12 text-muted body-2-semi-bold">Chain ID</th>
									<th className="text-left p-12 text-muted body-2-semi-bold">Name</th>
									<th className="text-left p-12 text-muted body-2-semi-bold">Native Token</th>
									<th className="text-left p-12 text-muted body-2-semi-bold">Explorer</th>
								</tr>
							</thead>
							<tbody>
								{Object.entries(SUPPORTED_CHAINS).map(([chainId, chain]) => (
									<tr key={chainId} className="border-t border-muted">
										<td className="p-12 font-mono text-accent">{chainId}</td>
										<td className="p-12 text-base">{chain.name}</td>
										<td className="p-12 text-base">{chain.symbol}</td>
										<td className="p-12">
											<a
												href={chain.explorer}
												target="_blank"
												rel="noopener noreferrer"
												className="text-interactive hover:underline"
											>
												{chain.explorer.replace("https://", "")}
											</a>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</Section>

				{/* Supported Tokens */}
				<Section id="tokens" title="Supported Tokens">
					<p className="body-1 text-base mb-16">
						Tokens with known contract addresses on each chain:
					</p>
					<div className="space-y-16">
						{Object.entries(SUPPORTED_TOKENS).map(([chainId, tokens]) => (
							<div key={chainId}>
								<h4 className="body-1-semi-bold text-base mb-8">
									{SUPPORTED_CHAINS[Number(chainId) as keyof typeof SUPPORTED_CHAINS]?.name || chainId}
								</h4>
								<div className="rounded-md border border-muted overflow-hidden">
									<table className="w-full body-2">
										<thead className="bg-muted">
											<tr>
												<th className="text-left p-12 text-muted body-2-semi-bold">Token</th>
												<th className="text-left p-12 text-muted body-2-semi-bold">Decimals</th>
												<th className="text-left p-12 text-muted body-2-semi-bold">Contract Address</th>
											</tr>
										</thead>
										<tbody>
											{Object.entries(tokens).map(([symbol, token]) => (
												<tr key={symbol} className="border-t border-muted">
													<td className="p-12 body-2-semi-bold text-base">{symbol}</td>
													<td className="p-12 text-base">{token.decimals}</td>
													<td className="p-12 font-mono body-3 text-muted">
														{token.address}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						))}
					</div>
				</Section>

				{/* Error Handling */}
				<Section id="errors" title="Error Handling">
					<p className="body-1 text-base">
						The API returns consistent error responses for all failure cases.
					</p>

					<Subsection id="error-format" title="Error Response Format">
						<CodeBlock language="json" title="Error Response">
{`{
  "success": false,
  "error": "Human-readable error message"
}`}
						</CodeBlock>
					</Subsection>

					<Subsection id="error-codes" title="Common Errors">
						<div className="rounded-md border border-muted overflow-hidden">
							<table className="w-full body-2">
								<thead className="bg-muted">
									<tr>
										<th className="text-left p-12 text-muted body-2-semi-bold">Status</th>
										<th className="text-left p-12 text-muted body-2-semi-bold">Error</th>
										<th className="text-left p-12 text-muted body-2-semi-bold">Description</th>
									</tr>
								</thead>
								<tbody>
									<tr className="border-t border-muted">
										<td className="p-12 font-mono text-warning">400</td>
										<td className="p-12 text-base">Missing required fields</td>
										<td className="p-12 text-muted">Request body missing agentId or details</td>
									</tr>
									<tr className="border-t border-muted">
										<td className="p-12 font-mono text-warning">404</td>
										<td className="p-12 text-base">Intent not found</td>
										<td className="p-12 text-muted">The requested intent ID does not exist</td>
									</tr>
									<tr className="border-t border-muted">
										<td className="p-12 font-mono text-error">500</td>
										<td className="p-12 text-base">Internal server error</td>
										<td className="p-12 text-muted">Unexpected server error</td>
									</tr>
								</tbody>
							</table>
						</div>
					</Subsection>

					<Subsection id="retry-strategy" title="Retry Strategy">
						<div className="p-16 rounded-md bg-surface border border-muted">
							<p className="body-2 text-base mb-8">
								Recommended retry behavior:
							</p>
							<ul className="body-2 text-muted space-y-4 list-disc list-inside">
								<li><strong>4xx errors:</strong> Do not retry. Fix the request.</li>
								<li><strong>5xx errors:</strong> Retry with exponential backoff (1s, 2s, 4s, max 30s)</li>
								<li><strong>Network errors:</strong> Retry up to 3 times with 2s delay</li>
							</ul>
						</div>
					</Subsection>
				</Section>

				{/* Footer */}
				<div className="pt-32 border-t border-muted">
					<div className="flex items-center justify-between">
						<div>
							<p className="body-2 text-muted-subtle">
								Agent Intents API Documentation
							</p>
							<p className="body-3 text-muted-subtle mt-4">
								Built for the USDC OpenClaw Hackathon on Moltbook
							</p>
						</div>
						<Link
							to="/"
							className="px-16 py-8 rounded-md bg-accent text-on-accent body-2-semi-bold hover:bg-accent-hover transition-colors"
						>
							View Intent Queue →
						</Link>
					</div>
				</div>
			</main>
		</div>
	);
}
