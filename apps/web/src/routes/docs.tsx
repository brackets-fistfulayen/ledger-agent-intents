import { createFileRoute, Link } from "@tanstack/react-router";
import { SUPPORTED_CHAINS, SUPPORTED_TOKENS } from "@agent-intents/shared";
import { Tag } from "@ledgerhq/lumen-ui-react";
import { CodeBlock } from "@/components/ui";

export const Route = createFileRoute("/docs")({
	component: DocsPage,
	head: () => ({
		meta: [
			{ title: "API Documentation | Ledger Agent Payments" },
			{
				name: "description",
				content:
					"API documentation for AI agents to submit transaction intents for Ledger hardware signing.",
			},
		],
	}),
});

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
		GET: "bg-success/20 text-success",
		POST: "bg-interactive/20 text-interactive",
		PATCH: "bg-warning/20 text-warning",
		DELETE: "bg-error/20 text-error",
	};

	return (
		<div className="flex items-start gap-12 p-16 rounded-md bg-muted">
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
		<div className="flex items-start gap-8 py-8 border-b border-[#30363d] last:border-0">
			<code className="body-2 text-accent font-mono whitespace-nowrap">
				{name}
			</code>
			<span className="body-4 text-[#8b949e] bg-[#21262d] px-6 py-2 rounded-xs">
				{type}
			</span>
			{required && (
				<span className="body-4 text-[#f85149] bg-[#f8514920] px-6 py-2 rounded-xs">
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
						<NavLink href="#agents">Agents</NavLink>
					</div>
					<div>
						<h4 className="body-4-semi-bold text-muted-subtle uppercase tracking-wider mb-8 px-12">
							x402 & Advanced
						</h4>
						<NavLink href="#x402-flow">x402 Payment Flow</NavLink>
						<NavLink href="#rate-limits">Rate Limits</NavLink>
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
						<h1 className="heading-2-semi-bold text-base">Ledger Agent Payments API</h1>
						<p className="body-1 text-muted mt-8">
							Documentation for AI agents to submit transaction intents for Ledger hardware signing.
						</p>
					</div>
					<div className="flex items-center gap-16 p-16 rounded-md bg-accent/10">
						<span className="text-2xl">🤖</span>
						<div>
							<p className="body-2-semi-bold text-accent">Built for Agents</p>
							<p className="body-2 text-muted">
								This API enables AI agents to propose transactions. Humans review
								and sign on Ledger hardware.
							</p>
						</div>
					</div>
				</div>

				{/* Overview */}
				<Section id="overview" title="Overview">
					<p className="body-1 text-base">
						The Ledger Agent Payments API allows AI agents to submit transaction intents that will be queued for human review and hardware signing. This creates a secure bridge where agents can propose transactions but never access private keys.
					</p>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-16">
						<div className="p-16 rounded-md bg-muted">
							<div className="text-2xl mb-8">📝</div>
							<h4 className="body-1-semi-bold text-base">1. Agent Proposes</h4>
							<p className="body-2 text-muted mt-4">
								Submit a structured intent via API or CLI. Get an intent ID for
								tracking.
							</p>
						</div>
						<div className="p-16 rounded-md bg-muted">
							<div className="text-2xl mb-8">👀</div>
							<h4 className="body-1-semi-bold text-base">2. Human Reviews</h4>
							<p className="body-2 text-muted mt-4">
								User sees the intent in the web app with full transaction details.
							</p>
						</div>
						<div className="p-16 rounded-md bg-muted">
							<div className="text-2xl mb-8">🔐</div>
							<h4 className="body-1-semi-bold text-base">3. Ledger Signs</h4>
							<p className="body-2 text-muted mt-4">
								Transaction is signed on Ledger device and broadcast to the
								blockchain.
							</p>
						</div>
					</div>

					<CodeBlock language="text" title="Architecture" className="font-mono">
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
						Create your first intent with AgentAuth. Your agent key must be registered first (human signs authorization on Ledger).
					</p>

					<Subsection id="quick-start-curl" title="1. Create an Intent">
						<CodeBlock language="bash" title="POST /api/intents (with AgentAuth)">
{`curl -X POST https://agent-intents-web.vercel.app/api/intents \\
  -H "Content-Type: application/json" \\
  -H "Authorization: AgentAuth <timestamp>.<bodyHash>.<signature>" \\
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
  }'`}
						</CodeBlock>
					</Subsection>

					<Subsection id="quick-start-response" title="2. Response (201)">
						<CodeBlock language="json" title="Success Response">
{`{
  "success": true,
  "intent": {
    "id": "int_1707048000_abc12345",
    "userId": "0xabcdef1234567890abcdef1234567890abcdef12",
    "agentId": "my-research-bot",
    "agentName": "Research Assistant",
    "status": "pending",
    "details": {
      "type": "transfer",
      "token": "USDC",
      "amount": "5.00",
      "recipient": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      "chainId": 8453,
      "memo": "API access fee for CoinGecko Pro"
    },
    "urgency": "normal",
    "createdAt": "2026-02-06T10:00:00.000Z",
    "expiresAt": "2026-02-06T11:00:00.000Z",
    "statusHistory": [
      { "status": "pending", "timestamp": "2026-02-06T10:00:00.000Z" }
    ]
  },
  "paymentUrl": "https://agent-intents-web.vercel.app/pay/int_1707048000_abc12345"
}`}
						</CodeBlock>
						<div className="p-16 rounded-md bg-accent/10 mt-12">
							<p className="body-2 text-accent">
								<strong>Share the paymentUrl</strong> with the human. They open it in their browser to review and sign the payment on their Ledger.
							</p>
						</div>
					</Subsection>

					<Subsection id="quick-start-poll" title="3. Poll for Status">
						<CodeBlock language="bash" title="GET /api/intents/:id">
{`curl https://agent-intents-web.vercel.app/api/intents/int_1707048000_abc12345 \\
  -H "Authorization: AgentAuth <timestamp>.<bodyHash>.<signature>"`}
						</CodeBlock>
						<p className="body-2 text-muted mt-8">
							Poll until <code className="bg-muted px-4 py-2 rounded-xs text-accent">status</code> reaches
							a terminal state: <code className="bg-muted px-4 py-2 rounded-xs text-accent">confirmed</code>,{" "}
							<code className="bg-muted px-4 py-2 rounded-xs text-accent">rejected</code>,{" "}
							<code className="bg-muted px-4 py-2 rounded-xs text-accent">failed</code>, or{" "}
							<code className="bg-muted px-4 py-2 rounded-xs text-accent">expired</code>.
							With AgentAuth, the response includes full x402 secrets if applicable.
						</p>
					</Subsection>
				</Section>

				{/* Authentication */}
				<Section id="authentication" title="Authentication">
					<Subsection id="auth-agentauth" title="AgentAuth (for agents)">
						<div className="p-16 rounded-md bg-interactive/10">
							<p className="body-2 text-interactive">
								Every authenticated agent request must include:
							</p>
							<CodeBlock language="text" title="Authorization Header">
{`Authorization: AgentAuth <timestamp>.<bodyHash>.<signature>`}
							</CodeBlock>
						</div>
						<div className="rounded-lg p-16 bg-[#0d1117] mt-12">
							<Param name="timestamp" type="number" required description="Unix epoch seconds. Must be within 5 minutes of server time." />
							<Param name="bodyHash" type="string" required description="keccak256 of the raw JSON body as hex. Use '0x' for GET requests." />
							<Param name="signature" type="string" required description="EIP-191 personal_sign of '<timestamp>.<bodyHash>' using the agent's secp256k1 private key." />
						</div>
						<p className="body-2 text-muted mt-12">
							The server recovers the signer address from the signature and matches it against registered agent public keys. The intent is automatically linked to the agent's trustchain identity.
						</p>
					</Subsection>
					<Subsection id="auth-session" title="Session Cookie (for web UI humans)">
						<p className="body-2 text-muted">
							The web UI uses{" "}
							<code className="bg-muted px-4 py-2 rounded-xs text-accent">POST /api/auth/challenge</code> +{" "}
							<code className="bg-muted px-4 py-2 rounded-xs text-accent">POST /api/auth/verify</code>{" "}
							(EIP-712) to establish an{" "}
							<code className="bg-muted px-4 py-2 rounded-xs text-accent">ai_session</code> cookie (valid 7 days).
							This is used for human actions like approve, reject, and authorize. Agents do not use session cookies.
						</p>
					</Subsection>
				</Section>

				{/* API Reference: Create Intent */}
				<Section id="create-intent" title="Create Intent">
					<Endpoint
						method="POST"
						path="/api/intents"
						description="Submit a new transaction intent for human review and signing."
					/>

					<Subsection id="create-intent-params" title="Request Body">
						<div className="rounded-lg p-16 bg-[#0d1117]">
							<Param
								name="agentId"
								type="string"
								required
								description="Your agent's unique identifier (e.g., 'research-bot', 'trading-agent')"
							/>
							<Param
								name="agentName"
								type="string"
								description="Human-readable display name (defaults to agentId if omitted)"
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
						<p className="body-2 text-muted mt-8">
							The <code className="bg-muted px-4 py-2 rounded-xs text-accent">userId</code> is automatically derived from your AgentAuth — do not pass it in the body.
						</p>
					</Subsection>

					<Subsection id="transfer-intent-schema" title="TransferIntent Schema">
						<div className="rounded-lg p-16 bg-[#0d1117]">
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
								description="Human-readable amount (e.g., '50', '0.01')"
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
								description="Chain ID: 8453 (Base), 11155111 (Sepolia), 84532 (Base Sepolia)"
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
							<Param
								name="resource"
								type="string"
								description="x402: URL of the resource being paid for"
							/>
							<Param
								name="category"
								type="string"
								description="Payment category: 'api_payment' | 'subscription' | 'purchase' | 'p2p_transfer' | 'defi' | 'bill_payment' | 'donation' | 'other'"
							/>
							<Param
								name="x402"
								type="object"
								description="Full x402 payment context with resource and accepted payment requirements"
							/>
						</div>
					</Subsection>

					<Subsection id="create-intent-example" title="Full Example">
						<CodeBlock language="json" title="Request Body (with AgentAuth header)">
{`{
  "agentId": "podcast-agent",
  "agentName": "Podcast Payment Bot",
  "urgency": "normal",
  "expiresInMinutes": 60,
  "details": {
    "type": "transfer",
    "token": "USDC",
    "amount": "200",
    "recipient": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    "chainId": 8453,
    "memo": "Payment to Seth for podcast intro music"
  }
}`}
						</CodeBlock>
					</Subsection>

					<Subsection id="create-intent-response" title="Response (201)">
						<p className="body-2 text-muted mb-8">
							The response includes a <code className="bg-muted px-4 py-2 rounded-xs text-accent">paymentUrl</code> that you can share with
							the user so they can review and sign the payment directly in their browser.
						</p>
						<CodeBlock language="json" title="Response">
{`{
  "success": true,
  "intent": {
    "id": "int_1707048000_abc12345",
    "status": "pending",
    ...
  },
  "paymentUrl": "https://your-app.vercel.app/pay/int_1707048000_abc12345"
}`}
						</CodeBlock>
						<p className="body-2 text-muted mt-8">
							Send this link to the user — they'll be able to connect their Ledger and approve the payment.
							If generating a link isn't possible, direct the user to the main dashboard where all pending intents are displayed.
						</p>
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
						<CodeBlock language="text" title="State Machine">
{`pending → approved → broadcasting → confirmed       (on-chain tx path)
pending → approved → authorized → executing → confirmed  (x402 path)
pending → rejected
any non-terminal → expired  (cron job, every minute)
any non-terminal → failed`}
						</CodeBlock>
						<div className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-16">
							{(
								[
									{
										status: "pending",
										appearance: "warning",
										desc: "Created by agent, awaiting human review",
										setBy: "System",
									},
									{
										status: "approved",
										appearance: "accent",
										desc: "Human approved, ready to sign",
										setBy: "Human",
									},
									{
										status: "broadcasting",
										appearance: "accent",
										desc: "Signed on Ledger, tx broadcasting",
										setBy: "Human",
									},
									{
										status: "authorized",
										appearance: "success",
										desc: "x402 payment signature ready for agent",
										setBy: "Human",
									},
									{
										status: "executing",
										appearance: "accent",
										desc: "Agent retrying with payment signature",
										setBy: "Agent",
									},
									{
										status: "confirmed",
										appearance: "success",
										desc: "Transaction confirmed on-chain / x402 settled",
										setBy: "Agent/System",
									},
									{
										status: "rejected",
										appearance: "error",
										desc: "Human rejected the intent",
										setBy: "Human",
									},
									{
										status: "failed",
										appearance: "error",
										desc: "Transaction or payment failed",
										setBy: "Agent/System",
									},
									{
										status: "expired",
										appearance: "gray",
										desc: "Expired without action",
										setBy: "Cron",
									},
								] as const
							).map(({ status, appearance, desc, setBy }) => (
								<div
									key={status}
									className="p-12 rounded-md bg-muted text-center flex flex-col items-center gap-8"
								>
									<Tag appearance={appearance} label={status} size="md" />
									<div className="body-3 text-muted-subtle">{desc}</div>
									<div className="body-4 text-muted-subtle">Set by: {setBy}</div>
								</div>
							))}
						</div>
						<p className="body-2 text-muted mt-12">
							<strong>Terminal states</strong> (no further transitions):{" "}
							<code className="bg-muted px-4 py-2 rounded-xs text-accent">rejected</code>,{" "}
							<code className="bg-muted px-4 py-2 rounded-xs text-accent">confirmed</code>,{" "}
							<code className="bg-muted px-4 py-2 rounded-xs text-accent">failed</code>,{" "}
							<code className="bg-muted px-4 py-2 rounded-xs text-accent">expired</code>
						</p>
					</Subsection>

					<Subsection id="polling-strategy" title="Polling Strategy">
						<div className="p-16 rounded-md bg-muted">
							<p className="body-2 text-base mb-12">
								Recommended polling intervals based on urgency:
							</p>
							<div className="space-y-8">
								<div className="flex items-center gap-12">
									<code className="text-error bg-error/20 px-8 py-4 rounded-xs body-3">
										critical
									</code>
									<span className="text-muted body-2">→ Every 5 seconds</span>
								</div>
								<div className="flex items-center gap-12">
									<code className="text-warning bg-warning/20 px-8 py-4 rounded-xs body-3">
										high
									</code>
									<span className="text-muted body-2">→ Every 15 seconds</span>
								</div>
								<div className="flex items-center gap-12">
									<code className="text-interactive bg-interactive/20 px-8 py-4 rounded-xs body-3">
										normal
									</code>
									<span className="text-muted body-2">→ Every 30 seconds</span>
								</div>
								<div className="flex items-center gap-12">
									<code className="text-muted-subtle bg-[#21262d] px-8 py-4 rounded-xs body-3">
										low
									</code>
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
						path="/api/intents"
						description="List intents for a user via query parameters (recommended for tools)."
					/>
					<Endpoint
						method="GET"
						path="/api/users/:userId/intents"
						description="List intents for a user via path parameter (equivalent to /api/intents?userId=...)."
					/>

					<Subsection id="list-intents-params" title="Query Parameters">
						<div className="rounded-lg p-16 bg-[#0d1117]">
							<Param
								name="userId"
								type="string"
								required
								description="Required for /api/intents. (For /api/users/:userId/intents this is provided in the path.)"
							/>
							<Param
								name="status"
								type="string"
								description="Filter by status: 'pending' | 'approved' | 'rejected' | 'broadcasting' | 'authorized' | 'executing' | 'confirmed' | 'failed' | 'expired'"
							/>
							<Param
								name="limit"
								type="number"
								description="Max number of intents to return (1–100, default: 50)"
							/>
						</div>
					</Subsection>

					<Subsection id="list-intents-example" title="Example">
						<CodeBlock language="bash" title="List Pending Intents (query style)">
{`curl "https://your-api-url.com/api/intents?userId=ian&status=pending&limit=50"`}
						</CodeBlock>
						<CodeBlock language="bash" title="List Pending Intents (path style)">
{`curl "https://your-api-url.com/api/users/ian/intents?status=pending&limit=50"`}
						</CodeBlock>
					</Subsection>
				</Section>

				{/* API Reference: Update Status */}
				<Section id="update-status" title="Update Status">
					<Endpoint
						method="POST"
						path="/api/intents/status"
						description="Update intent status. Requires AgentAuth or Session Cookie. Preferred route."
					/>
					<Endpoint
						method="PATCH"
						path="/api/intents/:id/status"
						description="Legacy alternative (intent ID in path instead of body)."
					/>

					<Subsection id="update-status-body" title="Request Body (POST route)">
						<div className="rounded-lg p-16 bg-[#0d1117]">
							<Param name="id" type="string" required description="Intent ID" />
							<Param name="status" type="string" required description="New status (see permissions below)" />
							<Param name="txHash" type="string" description="Transaction hash (if applicable)" />
							<Param name="note" type="string" description="Audit note" />
							<Param name="settlementReceipt" type="object" description="x402 settlement receipt from the server" />
						</div>
					</Subsection>

					<Subsection id="update-status-permissions" title="Permission Matrix">
						<div className="rounded-md overflow-hidden bg-[#0d1117]">
							<table className="w-full body-2">
								<thead className="bg-[#161b22]">
									<tr>
										<th className="text-left p-12 text-[#8b949e] body-2-semi-bold">Auth Type</th>
										<th className="text-left p-12 text-[#8b949e] body-2-semi-bold">Allowed Statuses</th>
									</tr>
								</thead>
								<tbody>
									<tr className="border-t border-[#30363d]">
										<td className="p-12 text-accent body-2-semi-bold">AgentAuth</td>
										<td className="p-12 text-base">
											<code className="bg-muted px-4 py-2 rounded-xs">executing</code>{" "}
											<code className="bg-muted px-4 py-2 rounded-xs">confirmed</code>{" "}
											<code className="bg-muted px-4 py-2 rounded-xs">failed</code>
										</td>
									</tr>
									<tr className="border-t border-[#30363d]">
										<td className="p-12 text-interactive body-2-semi-bold">Session Cookie</td>
										<td className="p-12 text-base">
											<code className="bg-muted px-4 py-2 rounded-xs">approved</code>{" "}
											<code className="bg-muted px-4 py-2 rounded-xs">rejected</code>{" "}
											<code className="bg-muted px-4 py-2 rounded-xs">authorized</code>{" "}
											<code className="bg-muted px-4 py-2 rounded-xs">broadcasting</code>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</Subsection>

					<div className="p-16 rounded-md bg-accent/10">
						<p className="body-2 text-accent">
							<strong>For agents:</strong> After the human authorizes an x402 payment, update status to{" "}
							<code className="bg-accent/20 px-4 py-2 rounded-xs">executing</code>, then to{" "}
							<code className="bg-accent/20 px-4 py-2 rounded-xs">confirmed</code> or{" "}
							<code className="bg-accent/20 px-4 py-2 rounded-xs">failed</code> based on the outcome.
						</p>
					</div>

					<p className="body-2 text-muted mt-8">
						<strong>Errors:</strong>{" "}
						<code className="bg-muted px-4 py-2 rounded-xs text-warning">400</code> invalid fields,{" "}
						<code className="bg-muted px-4 py-2 rounded-xs text-error">401</code> auth failed,{" "}
						<code className="bg-muted px-4 py-2 rounded-xs text-error">403</code> wrong owner or disallowed status,{" "}
						<code className="bg-muted px-4 py-2 rounded-xs text-warning">404</code> not found,{" "}
						<code className="bg-muted px-4 py-2 rounded-xs text-warning">409</code> invalid state transition
					</p>
				</Section>

				{/* API Reference: Agents */}
				<Section id="agents" title="Agents">
					<p className="body-1 text-base">
						Register an agent public key under a trustchain identity, then use AgentAuth to
						authenticate calls like <code className="bg-muted px-4 py-2 rounded-xs text-accent">POST /api/intents</code>.
					</p>

					<Endpoint
						method="POST"
						path="/api/agents/register"
						description="Register a new agent public key under a trustchain identity."
					/>
					<Subsection id="register-agent-body" title="Request Body">
						<div className="rounded-lg p-16 bg-[#0d1117]">
							<Param
								name="trustChainId"
								type="string"
								required
								description="Trustchain identity (wallet address from the Ledger device)"
							/>
							<Param
								name="agentPublicKey"
								type="string"
								required
								description="0x-prefixed hex-encoded secp256k1 compressed public key"
							/>
							<Param
								name="agentLabel"
								type="string"
								description="Optional human-readable label"
							/>
							<Param
								name="authorizationSignature"
								type="string"
								required
								description="EIP-191 personal_sign signature proving device authorization"
							/>
						</div>
					</Subsection>

					<Endpoint
						method="GET"
						path="/api/agents?trustchainId=..."
						description="List all agents (including revoked) for a trustchain."
					/>
					<Endpoint
						method="GET"
						path="/api/agents/:id"
						description="Get agent details by member ID."
					/>
					<Endpoint
						method="POST"
						path="/api/agents/revoke"
						description="Revoke an agent using a static route (preferred; avoids Vercel dynamic-route issues)."
					/>
					<Endpoint
						method="DELETE"
						path="/api/agents/:id"
						description="Legacy alternative: revoke an agent via DELETE."
					/>
				</Section>

				{/* x402 Payment Flow */}
				<Section id="x402-flow" title="x402 Payment Flow">
					<p className="body-1 text-base">
						When your agent encounters an HTTP{" "}
						<code className="bg-muted px-4 py-2 rounded-xs text-accent">402 Payment Required</code>{" "}
						response from an x402 server, use this flow:
					</p>

					<div className="space-y-8">
						<div className="flex items-start gap-12 p-12 rounded-md bg-muted">
							<span className="body-1-semi-bold text-accent w-24 text-center">1</span>
							<p className="body-2 text-base flex-1">
								<strong>Parse</strong> the <code className="bg-[#21262d] px-4 py-2 rounded-xs">PAYMENT-REQUIRED</code> header to extract payment requirements (network, amount, asset, payTo)
							</p>
						</div>
						<div className="flex items-start gap-12 p-12 rounded-md bg-muted">
							<span className="body-1-semi-bold text-accent w-24 text-center">2</span>
							<p className="body-2 text-base flex-1">
								<strong>Create intent</strong> with <code className="bg-[#21262d] px-4 py-2 rounded-xs">details.x402</code> containing the resource URL and accepted payment fields
							</p>
						</div>
						<div className="flex items-start gap-12 p-12 rounded-md bg-muted">
							<span className="body-1-semi-bold text-accent w-24 text-center">3</span>
							<p className="body-2 text-base flex-1">
								<strong>Share the <code className="bg-[#21262d] px-4 py-2 rounded-xs">paymentUrl</code></strong> with the human — they sign the EIP-3009 TransferWithAuthorization on their Ledger
							</p>
						</div>
						<div className="flex items-start gap-12 p-12 rounded-md bg-muted">
							<span className="body-1-semi-bold text-accent w-24 text-center">4</span>
							<p className="body-2 text-base flex-1">
								<strong>Poll</strong> until status = <code className="bg-[#21262d] px-4 py-2 rounded-xs">authorized</code>
							</p>
						</div>
						<div className="flex items-start gap-12 p-12 rounded-md bg-muted">
							<span className="body-1-semi-bold text-accent w-24 text-center">5</span>
							<p className="body-2 text-base flex-1">
								<strong>Fetch intent</strong> with AgentAuth — response now includes <code className="bg-[#21262d] px-4 py-2 rounded-xs">details.x402.paymentSignatureHeader</code>
							</p>
						</div>
						<div className="flex items-start gap-12 p-12 rounded-md bg-muted">
							<span className="body-1-semi-bold text-accent w-24 text-center">6</span>
							<p className="body-2 text-base flex-1">
								<strong>Retry</strong> your original HTTP request with <code className="bg-[#21262d] px-4 py-2 rounded-xs">PAYMENT: &lt;paymentSignatureHeader&gt;</code> header
							</p>
						</div>
						<div className="flex items-start gap-12 p-12 rounded-md bg-muted">
							<span className="body-1-semi-bold text-accent w-24 text-center">7</span>
							<p className="body-2 text-base flex-1">
								<strong>Update status</strong> to <code className="bg-[#21262d] px-4 py-2 rounded-xs">confirmed</code> (with settlement receipt) or <code className="bg-[#21262d] px-4 py-2 rounded-xs">failed</code>
							</p>
						</div>
					</div>

					<Subsection id="x402-example" title="x402 Intent Example">
						<CodeBlock language="json" title="Request body with x402 context">
{`{
  "agentId": "my-agent",
  "details": {
    "type": "transfer",
    "token": "USDC",
    "amount": "0.01",
    "recipient": "0xPayToAddress...",
    "chainId": 8453,
    "memo": "x402 payment for api.coingecko.com",
    "resource": "https://api.coingecko.com/pro/v1/coins/bitcoin",
    "category": "api_payment",
    "x402": {
      "resource": { "url": "https://api.coingecko.com/pro/v1/coins/bitcoin" },
      "accepted": {
        "scheme": "exact",
        "network": "eip155:8453",
        "amount": "10000",
        "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        "payTo": "0xPayToAddress..."
      }
    }
  }
}`}
						</CodeBlock>
					</Subsection>
				</Section>

				{/* Rate Limits */}
				<Section id="rate-limits" title="Rate Limits">
					<div className="rounded-md overflow-hidden bg-[#0d1117]">
						<table className="w-full body-2">
							<thead className="bg-[#161b22]">
								<tr>
									<th className="text-left p-12 text-[#8b949e] body-2-semi-bold">Endpoint</th>
									<th className="text-left p-12 text-[#8b949e] body-2-semi-bold">Limit</th>
									<th className="text-left p-12 text-[#8b949e] body-2-semi-bold">HTTP Code</th>
								</tr>
							</thead>
							<tbody>
								<tr className="border-t border-[#30363d]">
									<td className="p-12 font-mono text-accent">POST /api/intents</td>
									<td className="p-12 text-base">10 per agent per minute</td>
									<td className="p-12 font-mono text-warning">429</td>
								</tr>
								<tr className="border-t border-[#30363d]">
									<td className="p-12 font-mono text-accent">POST /api/agents/register</td>
									<td className="p-12 text-base">5 per wallet per minute</td>
									<td className="p-12 font-mono text-warning">429</td>
								</tr>
							</tbody>
						</table>
					</div>
				</Section>

				{/* CLI Skill */}
				<Section id="cli-install" title="CLI Skill Installation">
					<p className="body-1 text-base">
						The <code className="bg-muted px-4 py-2 rounded-xs text-accent">ledger-intent</code> CLI provides a convenient way to interact with the API.
					</p>

					<Subsection id="cli-env" title="Environment Variables">
						<div className="rounded-lg p-16 bg-[#0d1117]">
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
  userId: string;                // Wallet address of the human signer
  agentId: string;               // Agent that created the intent
  agentName: string;             // Agent display name
  
  details: TransferIntent;       // Transaction details
  urgency: IntentUrgency;        // "low" | "normal" | "high" | "critical"
  status: IntentStatus;          // Current status in lifecycle
  
  // Trustchain (set when created by authenticated agent)
  trustChainId?: string;         // Owner's wallet address
  createdByMemberId?: string;    // Agent member UUID
  
  // Timestamps (ISO 8601)
  createdAt: string;
  expiresAt?: string;
  reviewedAt?: string;
  broadcastAt?: string;
  confirmedAt?: string;
  
  // Transaction result
  txHash?: string;               // Transaction hash after confirmation
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
  chainId: number;               // Chain ID (8453, 11155111, 84532)
  memo?: string;                 // Human-readable reason
  
  // x402-aligned fields
  resource?: string;             // x402 resource URL being paid for
  category?: PaymentCategory;    // Payment category
  x402?: X402Context;            // Full x402 payment context
}`}
						</CodeBlock>
					</Subsection>

					<Subsection id="status-enum" title="IntentStatus Enum">
						<CodeBlock language="typescript" title="IntentStatus Type">
{`type IntentStatus =
  | "pending"      // Created by agent, awaiting human review
  | "approved"     // Human approved, ready to sign
  | "rejected"     // Human rejected
  | "broadcasting" // Signed on device, broadcasting tx
  | "authorized"   // x402 payment authorized, agent can use it
  | "executing"    // Agent retrying with payment signature (x402)
  | "confirmed"    // Transaction confirmed on-chain / x402 settled
  | "failed"       // Transaction or payment failed
  | "expired";     // Intent expired without action

// Terminal states (no further transitions):
// rejected, confirmed, failed, expired`}
						</CodeBlock>
					</Subsection>
				</Section>

				{/* Supported Chains */}
				<Section id="chains" title="Supported Chains">
					<p className="body-1 text-base mb-16">
						Supported chains (Base mainnet + testnets):
					</p>
					<div className="rounded-md overflow-hidden bg-[#0d1117]">
						<table className="w-full body-2">
							<thead className="bg-[#161b22]">
								<tr>
									<th className="text-left p-12 text-[#8b949e] body-2-semi-bold">
										Chain ID
									</th>
									<th className="text-left p-12 text-[#8b949e] body-2-semi-bold">
										Name
									</th>
									<th className="text-left p-12 text-[#8b949e] body-2-semi-bold">
										Native Token
									</th>
									<th className="text-left p-12 text-[#8b949e] body-2-semi-bold">
										Explorer
									</th>
								</tr>
							</thead>
							<tbody>
								{Object.entries(SUPPORTED_CHAINS).map(([chainId, chain]) => (
									<tr key={chainId} className="border-t border-[#30363d]">
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
									{SUPPORTED_CHAINS[
										Number(chainId) as keyof typeof SUPPORTED_CHAINS
									]?.name || chainId}
								</h4>
								<div className="rounded-md overflow-hidden bg-[#0d1117]">
									<table className="w-full body-2">
										<thead className="bg-[#161b22]">
											<tr>
												<th className="text-left p-12 text-[#8b949e] body-2-semi-bold">
													Token
												</th>
												<th className="text-left p-12 text-[#8b949e] body-2-semi-bold">
													Decimals
												</th>
												<th className="text-left p-12 text-[#8b949e] body-2-semi-bold">
													Contract Address
												</th>
											</tr>
										</thead>
										<tbody>
											{Object.entries(tokens).map(([symbol, token]) => (
												<tr key={symbol} className="border-t border-[#30363d]">
													<td className="p-12 body-2-semi-bold text-base">
														{symbol}
													</td>
													<td className="p-12 text-base">{token.decimals}</td>
													<td className="p-12 font-mono body-3 text-[#8b949e]">
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
						<div className="rounded-md overflow-hidden bg-[#0d1117]">
							<table className="w-full body-2">
								<thead className="bg-[#161b22]">
									<tr>
										<th className="text-left p-12 text-[#8b949e] body-2-semi-bold">
											Status
										</th>
										<th className="text-left p-12 text-[#8b949e] body-2-semi-bold">
											Error
										</th>
										<th className="text-left p-12 text-[#8b949e] body-2-semi-bold">
											Description
										</th>
									</tr>
								</thead>
								<tbody>
									<tr className="border-t border-[#30363d]">
										<td className="p-12 font-mono text-warning">400</td>
										<td className="p-12 text-base">Bad request</td>
										<td className="p-12 text-[#8b949e]">
											Missing or invalid fields. Fix the request.
										</td>
									</tr>
									<tr className="border-t border-[#30363d]">
										<td className="p-12 font-mono text-error">401</td>
										<td className="p-12 text-base">Authentication failed</td>
										<td className="p-12 text-[#8b949e]">
											Missing or invalid AgentAuth header or session cookie
										</td>
									</tr>
									<tr className="border-t border-[#30363d]">
										<td className="p-12 font-mono text-error">403</td>
										<td className="p-12 text-base">Forbidden</td>
										<td className="p-12 text-[#8b949e]">
											Wrong owner, signature mismatch, or disallowed status transition
										</td>
									</tr>
									<tr className="border-t border-[#30363d]">
										<td className="p-12 font-mono text-warning">404</td>
										<td className="p-12 text-base">Not found</td>
										<td className="p-12 text-[#8b949e]">
											Intent or agent ID does not exist
										</td>
									</tr>
									<tr className="border-t border-[#30363d]">
										<td className="p-12 font-mono text-warning">409</td>
										<td className="p-12 text-base">Conflict</td>
										<td className="p-12 text-[#8b949e]">
											Invalid state transition or duplicate registration
										</td>
									</tr>
									<tr className="border-t border-[#30363d]">
										<td className="p-12 font-mono text-warning">429</td>
										<td className="p-12 text-base">Rate limited</td>
										<td className="p-12 text-[#8b949e]">
											Too many requests. Wait 60 seconds and retry.
										</td>
									</tr>
									<tr className="border-t border-[#30363d]">
										<td className="p-12 font-mono text-error">500</td>
										<td className="p-12 text-base">Server error</td>
										<td className="p-12 text-[#8b949e]">Retry with exponential backoff</td>
									</tr>
									<tr className="border-t border-[#30363d]">
										<td className="p-12 font-mono text-error">503</td>
										<td className="p-12 text-base">Unavailable</td>
										<td className="p-12 text-[#8b949e]">Service temporarily unavailable. Retry with backoff.</td>
									</tr>
								</tbody>
							</table>
						</div>
					</Subsection>

					<Subsection id="retry-strategy" title="Retry Strategy">
						<div className="p-16 rounded-md bg-muted">
							<p className="body-2 text-base mb-8">Recommended retry behavior:</p>
							<ul className="body-2 text-muted space-y-4 list-disc list-inside">
								<li>
									<strong>400–499 errors:</strong> Do not retry. Fix the request.
								</li>
								<li>
									<strong>429 (rate limited):</strong> Wait 60 seconds, then retry.
								</li>
								<li>
									<strong>500–599 errors:</strong> Retry with exponential backoff
									(1s, 2s, 4s, max 30s)
								</li>
								<li>
									<strong>Network errors:</strong> Retry up to 3 times with 2s
									delay
								</li>
							</ul>
						</div>
					</Subsection>
				</Section>

				{/* Footer */}
				<div className="pt-32 border-t border-[#30363d]">
					<div className="flex items-center justify-between">
						<div>
							<p className="body-2 text-muted-subtle">
								Ledger Agent Payments API Documentation
							</p>
							<p className="body-3 text-muted-subtle mt-4">
								Machine-readable spec:{" "}
								<a href="/openapi.json" className="text-accent hover:underline">/openapi.json</a>
								{" | "}
								Static HTML docs:{" "}
								<a href="/docs" className="text-accent hover:underline">/docs</a>
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
