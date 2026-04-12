import { CodeBlock } from "@/components/ui";
import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/agent-context")({
	component: AgentContextPage,
	head: () => ({
		meta: [
			{ title: "Context for Agents | Agent Payments with Ledger" },
			{
				name: "description",
				content:
					"Quickstart guide for AI agents to create payment intents via CLI or API using a JSON credential file.",
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

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div className="space-y-12">
			<h3 className="heading-5-semi-bold text-base">{title}</h3>
			{children}
		</div>
	);
}

// =============================================================================
// Main Page
// =============================================================================

function AgentContextPage() {
	return (
		<div className="flex gap-32 max-w-7xl mx-auto">
			{/* Sidebar Navigation */}
			<nav className="hidden lg:block w-[220px] flex-shrink-0 sticky top-24 h-fit">
				<div className="space-y-24">
					<div>
						<h4 className="body-4-semi-bold text-muted-subtle uppercase tracking-wider mb-8 px-12">
							Skill (Recommended)
						</h4>
						<NavLink href="#skill">Download Skill</NavLink>
						<NavLink href="#skill-install">Install</NavLink>
						<NavLink href="#skill-commands">Commands</NavLink>
						<NavLink href="#skill-examples">Examples</NavLink>
					</div>
					<div>
						<h4 className="body-4-semi-bold text-muted-subtle uppercase tracking-wider mb-8 px-12">
							API (Direct HTTP)
						</h4>
						<NavLink href="#credential-file">Credential File</NavLink>
						<NavLink href="#agentauth-header">AgentAuth Header</NavLink>
						<NavLink href="#send-intent">Send an Intent</NavLink>
						<NavLink href="#poll">Poll for Completion</NavLink>
						<NavLink href="#api-example">Complete Bash Script</NavLink>
					</div>
					<div>
						<h4 className="body-4-semi-bold text-muted-subtle uppercase tracking-wider mb-8 px-12">
							Reference
						</h4>
						<NavLink href="#supported-chains">Supported Chains</NavLink>
						<NavLink href="#status-lifecycle">Status Lifecycle</NavLink>
						<NavLink href="#troubleshooting">Troubleshooting</NavLink>
					</div>
				</div>
			</nav>

			{/* Main Content */}
			<main className="flex-1 min-w-0 space-y-48 pb-64">
				{/* Header */}
				<div className="space-y-16">
					<div className="flex items-center gap-12">
						<Link to="/" className="body-2 text-muted hover:text-base transition-colors">
							&larr; Back to App
						</Link>
					</div>
					<div>
						<h1 className="heading-2-semi-bold text-base">Context for Agents</h1>
						<p className="body-1 text-muted mt-8">
							Two ways to create payment intents: the{" "}
							<a href="#skill" className="text-accent hover:underline">
								ledger-intent CLI
							</a>{" "}
							(recommended) or the{" "}
							<a href="#credential-file" className="text-accent hover:underline">
								HTTP API
							</a>{" "}
							directly.
						</p>
					</div>
					<div className="flex items-center gap-16 p-16 rounded-md bg-accent/10">
						<p className="body-2 text-base">
							<strong>Prerequisites:</strong> A credential file from the{" "}
							<Link to="/settings" className="text-accent hover:underline">
								Settings
							</Link>{" "}
							page (the human owner provisions your agent key with their Ledger device).
						</p>
					</div>
				</div>

				{/* ============================================================= */}
				{/* SKILL SECTION                                                 */}
				{/* ============================================================= */}

				<Section id="skill" title="CLI Skill (Recommended)">
					<p className="body-2 text-muted">
						The <strong>ledger-intent</strong> CLI handles authentication, request signing, and
						polling automatically. No need to manually construct AgentAuth headers.
					</p>

					<div className="p-16 rounded-md bg-success/10 border border-success/20">
						<p className="body-2 text-base">
							<strong>Download the skill file</strong> and include it in your agent's context window
							so it knows how to use the CLI:
						</p>
						<p className="body-2 mt-8">
							<a
								href="/agent-context/ledger-intent-skill.md"
								download="ledger-intent-skill.md"
								className="inline-flex items-center gap-8 px-16 py-8 rounded-md bg-accent text-on-accent body-2-semi-bold hover:bg-accent-hover transition-colors mt-8"
							>
								Download ledger-intent-skill.md
							</a>
						</p>
					</div>
				</Section>

				<Section id="skill-install" title="Install">
					<p className="body-2 text-muted">
						Clone the repo and build, or install the CLI globally from the monorepo:
					</p>
					<CodeBlock language="bash" title="Install from source">
						{`git clone https://github.com/brackets-fistfulayen/ledger-agent-intents.git
cd ledger-agent-intents
pnpm install && pnpm build

# Run directly
node packages/skill/bin/ledger-intent.js --help

# Or link globally
cd packages/skill && npm link
ledger-intent --help`}
					</CodeBlock>
				</Section>

				<Section id="skill-commands" title="Commands">
					<CodeBlock language="bash" title="CLI commands">
						{`# Create a payment intent
ledger-intent send <amount> <token> to <address> [for "reason"] [--chain <id>] [--urgency <level>]

# Check intent status
ledger-intent status <intent-id>

# List your intents
ledger-intent list [--status <status>] [--limit <n>]

# Poll until terminal state (confirmed, rejected, failed, expired)
ledger-intent poll <intent-id> [--interval <seconds>] [--timeout <seconds>]

# Check API connectivity (no credential required)
ledger-intent health`}
					</CodeBlock>

					<SubSection title="Global options">
						<div className="overflow-x-auto">
							<table className="w-full border-collapse">
								<thead>
									<tr className="border-b border-muted">
										<th className="text-left body-3-semi-bold text-muted-subtle py-8 pr-16">
											Flag
										</th>
										<th className="text-left body-3-semi-bold text-muted-subtle py-8">
											Description
										</th>
									</tr>
								</thead>
								<tbody className="body-2 text-muted">
									<tr className="border-b border-muted/50">
										<td className="py-8 pr-16">
											<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">
												--credential &lt;path&gt;
											</code>
										</td>
										<td className="py-8">Path to agent credential JSON file</td>
									</tr>
									<tr className="border-b border-muted/50">
										<td className="py-8 pr-16">
											<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">
												--api &lt;url&gt;
											</code>
										</td>
										<td className="py-8">
											API base URL (default:{" "}
											<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">
												https://www.agentintents.io
											</code>
											)
										</td>
									</tr>
									<tr className="border-b border-muted/50">
										<td className="py-8 pr-16">
											<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">
												--no-color
											</code>
										</td>
										<td className="py-8">Disable colored output</td>
									</tr>
								</tbody>
							</table>
						</div>
					</SubSection>

					<SubSection title="Credential resolution order">
						<ol className="list-decimal list-inside space-y-4 body-2 text-muted">
							<li>
								<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">
									--credential &lt;path&gt;
								</code>{" "}
								flag
							</li>
							<li>
								<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">
									AGENT_CREDENTIAL
								</code>{" "}
								environment variable
							</li>
							<li>
								<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">
									./agent-credential.json
								</code>{" "}
								in the current directory
							</li>
							<li>
								<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">
									~/.config/ledger-agent/credential.json
								</code>
							</li>
						</ol>
					</SubSection>
				</Section>

				<Section id="skill-examples" title="CLI Examples">
					<CodeBlock language="bash" title="Common workflows">
						{`# Pay for podcast work on Base (default chain)
ledger-intent send 50 USDC to 0x1234567890abcdef1234567890abcdef12345678 \\
  for "podcast intro music"

# Small payment on Base Sepolia testnet
ledger-intent send 0.01 USDC to 0xabcdefabcdefabcdefabcdefabcdefabcdefabcd \\
  --chain 84532

# Urgent payment
ledger-intent send 100 USDC to 0x1234567890abcdef1234567890abcdef12345678 \\
  --urgency high

# Check status
ledger-intent status int_1707048000_abc123

# Wait for the user to sign (polls every 5s, times out after 5 min)
ledger-intent poll int_1707048000_abc123

# Wait longer with custom interval
ledger-intent poll int_1707048000_abc123 --interval 10 --timeout 600

# List pending intents
ledger-intent list --status pending

# Verify API is reachable
ledger-intent health --api https://www.agentintents.io`}
					</CodeBlock>
				</Section>

				{/* Divider */}
				<div className="border-t border-[#30363d] pt-16">
					<p className="body-2 text-muted-subtle">
						If you prefer to call the API directly (without the CLI), continue below.
					</p>
				</div>

				{/* ============================================================= */}
				{/* API SECTION                                                    */}
				{/* ============================================================= */}

				{/* 1. Credential File */}
				<Section id="credential-file" title="API: Credential File">
					<p className="body-2 text-muted">
						You need a JSON credential file with this shape. The human owner generates this file
						when registering your agent from the{" "}
						<Link to="/settings" className="text-accent hover:underline">
							Settings
						</Link>{" "}
						page.
					</p>
					<CodeBlock language="json" title="agent-credential.json">
						{`{
  "version": 1,
  "label": "My Agent",
  "trustchainId": "0x<owner-wallet-address>",
  "privateKey": "0x<hex-encoded-secp256k1-private-key>",
  "publicKey": "0x<hex-encoded-compressed-public-key>",
  "createdAt": "2026-01-01T00:00:00.000Z"
}`}
					</CodeBlock>
					<div className="p-16 rounded-md bg-warning/10 border border-warning/20">
						<p className="body-2 text-base">
							<strong>Security:</strong> Never commit this file to version control. Add it to{" "}
							<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">.gitignore</code> and
							restrict file permissions (
							<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">chmod 600</code>).
							The <code className="px-4 py-2 rounded-xs bg-muted text-base body-3">privateKey</code>{" "}
							field is a secret — treat it like a password.
						</p>
					</div>
				</Section>

				{/* 2. AgentAuth Header */}
				<Section id="agentauth-header" title="API: Build the AgentAuth Header">
					<p className="body-2 text-muted">
						Every API request requires an{" "}
						<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">Authorization</code>{" "}
						header. The CLI builds this automatically; this section is for direct HTTP callers.
					</p>
					<CodeBlock language="text" title="Header format">
						{"Authorization: AgentAuth <timestamp>.<bodyHash>.<signature>"}
					</CodeBlock>

					<div className="overflow-x-auto">
						<table className="w-full border-collapse">
							<thead>
								<tr className="border-b border-muted">
									<th className="text-left body-3-semi-bold text-muted-subtle py-8 pr-16">Part</th>
									<th className="text-left body-3-semi-bold text-muted-subtle py-8">
										How to compute
									</th>
								</tr>
							</thead>
							<tbody className="body-2 text-muted">
								<tr className="border-b border-muted/50">
									<td className="py-8 pr-16">
										<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">
											timestamp
										</code>
									</td>
									<td className="py-8">
										Current Unix epoch in <strong>seconds</strong> (must be within 5 min of server
										time)
									</td>
								</tr>
								<tr className="border-b border-muted/50">
									<td className="py-8 pr-16">
										<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">bodyHash</code>
									</td>
									<td className="py-8">
										<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">
											cast keccak "$BODY"
										</code>{" "}
										for POST. For GET, use the literal string{" "}
										<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">0x</code>
									</td>
								</tr>
								<tr className="border-b border-muted/50">
									<td className="py-8 pr-16">
										<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">
											signature
										</code>
									</td>
									<td className="py-8">
										EIP-191{" "}
										<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">
											personal_sign
										</code>{" "}
										over{" "}
										<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">
											{"<timestamp>.<bodyHash>"}
										</code>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</Section>

				{/* 3. Send an Intent */}
				<Section id="send-intent" title="API: Send an Intent">
					<p className="body-2 text-muted">
						<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">
							POST https://www.agentintents.io/api/intents
						</code>
					</p>

					<SubSection title="Request body">
						<CodeBlock language="json" title="Compact JSON body">
							{
								'{"agentId":"my-agent","agentName":"My Agent","details":{"type":"transfer","token":"USDC","amount":"1.00","recipient":"0xRecipientAddress","chainId":8453,"memo":"Reason for payment"},"urgency":"normal","expiresInMinutes":60}'
							}
						</CodeBlock>
					</SubSection>

					<SubSection title="Response (201 Created)">
						<CodeBlock language="json" title="Response">
							{`{
  "success": true,
  "intent": {
    "id": "int_1770399036079_804497de",
    "status": "pending",
    "...": "..."
  },
  "paymentUrl": "https://www.agentintents.io/pay/int_1770399036079_804497de"
}`}
						</CodeBlock>
					</SubSection>

					<p className="body-2 text-muted">
						Share the{" "}
						<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">paymentUrl</code> with
						the human so they can review and sign the transaction.
					</p>
				</Section>

				{/* 4. Poll for Completion */}
				<Section id="poll" title="API: Poll for Completion">
					<p className="body-2 text-muted">
						<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">
							{"GET https://www.agentintents.io/api/intents/<intent-id>"}
						</code>
					</p>
					<p className="body-2 text-muted">
						Poll until{" "}
						<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">status</code> is one of
						the terminal states:{" "}
						<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">confirmed</code>,{" "}
						<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">rejected</code>,{" "}
						<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">failed</code>, or{" "}
						<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">expired</code>.
					</p>
				</Section>

				{/* Complete API Example */}
				<Section id="api-example" title="API: Complete Bash Script">
					<CodeBlock language="bash" title="create-intent.sh">
						{`#!/usr/bin/env bash
set -euo pipefail

# ── Configuration ────────────────────────────────────────────────
CREDENTIAL_FILE="agent-credential.json"
PRIVATE_KEY=$(jq -r '.privateKey' "$CREDENTIAL_FILE")
AGENT_LABEL=$(jq -r '.label' "$CREDENTIAL_FILE")

# ── 1. Build compact JSON body ──────────────────────────────────
BODY=$(jq -cn \\
  --arg agentName "$AGENT_LABEL" \\
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
SIGNATURE=$(cast wallet sign --private-key "$PRIVATE_KEY" "\${TIMESTAMP}.\${BODY_HASH}")

# ── 3. Send intent ──────────────────────────────────────────────
RESPONSE=$(curl -s -X POST "https://www.agentintents.io/api/intents" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: AgentAuth \${TIMESTAMP}.\${BODY_HASH}.\${SIGNATURE}" \\
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
  POLL_SIG=$(cast wallet sign --private-key "$PRIVATE_KEY" "\${POLL_TS}.0x")
  STATUS=$(curl -s "https://www.agentintents.io/api/intents/\${INTENT_ID}" \\
    -H "Authorization: AgentAuth \${POLL_TS}.0x.\${POLL_SIG}" \\
    | jq -r '.intent.status')
  echo "Poll $i: status=$STATUS"
done

echo "Final status: $STATUS"`}
					</CodeBlock>

					<div className="p-16 rounded-md bg-accent/10">
						<p className="body-2 text-base">
							<strong>Tip:</strong> The bash script above requires{" "}
							<a
								href="https://book.getfoundry.sh/getting-started/installation"
								target="_blank"
								rel="noopener noreferrer"
								className="text-accent hover:underline"
							>
								Foundry
							</a>{" "}
							(<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">cast</code>),{" "}
							<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">curl</code>, and{" "}
							<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">jq</code>. The CLI
							skill above has no external dependencies beyond Node.js.
						</p>
					</div>
				</Section>

				{/* ============================================================= */}
				{/* REFERENCE                                                      */}
				{/* ============================================================= */}

				{/* Supported Chains */}
				<Section id="supported-chains" title="Supported Chains">
					<div className="overflow-x-auto">
						<table className="w-full border-collapse">
							<thead>
								<tr className="border-b border-muted">
									<th className="text-left body-3-semi-bold text-muted-subtle py-8 pr-16">
										Chain ID
									</th>
									<th className="text-left body-3-semi-bold text-muted-subtle py-8 pr-16">Name</th>
									<th className="text-left body-3-semi-bold text-muted-subtle py-8 pr-16">Token</th>
									<th className="text-left body-3-semi-bold text-muted-subtle py-8">Notes</th>
								</tr>
							</thead>
							<tbody className="body-2 text-muted">
								<tr className="border-b border-muted/50">
									<td className="py-8 pr-16">
										<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">8453</code>
									</td>
									<td className="py-8 pr-16">Base</td>
									<td className="py-8 pr-16">USDC</td>
									<td className="py-8">Mainnet (default)</td>
								</tr>
								<tr className="border-b border-muted/50">
									<td className="py-8 pr-16">
										<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">84532</code>
									</td>
									<td className="py-8 pr-16">Base Sepolia</td>
									<td className="py-8 pr-16">USDC</td>
									<td className="py-8">Testnet</td>
								</tr>
								<tr className="border-b border-muted/50">
									<td className="py-8 pr-16">
										<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">11155111</code>
									</td>
									<td className="py-8 pr-16">Sepolia</td>
									<td className="py-8 pr-16">USDC</td>
									<td className="py-8">Testnet</td>
								</tr>
							</tbody>
						</table>
					</div>
				</Section>

				{/* Status Lifecycle */}
				<Section id="status-lifecycle" title="Intent Status Lifecycle">
					<CodeBlock language="text" title="Status transitions">
						{`pending → approved → broadcasting → confirmed
   │         │            │
   ├→ rejected  ├→ failed    └→ failed
   └→ expired   └→ expired

For x402 payments: pending → authorized → executing → confirmed`}
					</CodeBlock>
					<p className="body-2 text-muted">
						Terminal states:{" "}
						<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">confirmed</code>,{" "}
						<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">rejected</code>,{" "}
						<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">failed</code>,{" "}
						<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">expired</code>. Stop
						polling when you reach one of these.
					</p>
				</Section>

				{/* Troubleshooting */}
				<Section id="troubleshooting" title="Troubleshooting">
					<div className="overflow-x-auto">
						<table className="w-full border-collapse">
							<thead>
								<tr className="border-b border-muted">
									<th className="text-left body-3-semi-bold text-muted-subtle py-8 pr-16">Error</th>
									<th className="text-left body-3-semi-bold text-muted-subtle py-8 pr-16">Cause</th>
									<th className="text-left body-3-semi-bold text-muted-subtle py-8">Fix</th>
								</tr>
							</thead>
							<tbody className="body-2 text-muted">
								<tr className="border-b border-muted/50">
									<td className="py-8 pr-16">
										<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">
											401 Authentication failed
										</code>
									</td>
									<td className="py-8 pr-16">Signature or body hash is malformed</td>
									<td className="py-8">
										Ensure hex values are{" "}
										<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">0x</code>
										-prefixed
									</td>
								</tr>
								<tr className="border-b border-muted/50">
									<td className="py-8 pr-16">
										<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">
											401 Authentication failed
										</code>
									</td>
									<td className="py-8 pr-16">Timestamp drift</td>
									<td className="py-8">Ensure system clock is accurate (within 5 min)</td>
								</tr>
								<tr className="border-b border-muted/50">
									<td className="py-8 pr-16">
										<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">
											401 Authentication failed
										</code>
									</td>
									<td className="py-8 pr-16">Body hash mismatch</td>
									<td className="py-8">
										Hash the <strong>exact</strong> bytes sent (compact JSON, no trailing newline)
									</td>
								</tr>
								<tr className="border-b border-muted/50">
									<td className="py-8 pr-16">
										<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">
											401 Agent not registered
										</code>
									</td>
									<td className="py-8 pr-16">Agent key not provisioned or revoked</td>
									<td className="py-8">
										Provision a new key from the{" "}
										<Link to="/settings" className="text-accent hover:underline">
											Settings
										</Link>{" "}
										page
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</Section>

				{/* Footer */}
				<div className="pt-32 border-t border-[#30363d]">
					<div className="flex items-center justify-between">
						<div>
							<p className="body-2 text-muted-subtle">
								Agent Payments with Ledger — Context for Agents
							</p>
							<p className="body-3 text-muted-subtle mt-4">
								Full API reference:{" "}
								<Link to="/docs" className="text-accent hover:underline">
									/docs
								</Link>
								{" | "}
								Skill file:{" "}
								<a
									href="/agent-context/ledger-intent-skill.md"
									className="text-accent hover:underline"
								>
									ledger-intent-skill.md
								</a>
								{" | "}
								This page as Markdown:{" "}
								<a href="/agent-context.md" className="text-accent hover:underline">
									/agent-context.md
								</a>
							</p>
						</div>
						<Link
							to="/"
							className="px-16 py-8 rounded-md bg-accent text-on-accent body-2-semi-bold hover:bg-accent-hover transition-colors"
						>
							View Intent Queue &rarr;
						</Link>
					</div>
				</div>
			</main>
		</div>
	);
}

// =============================================================================
// NavLink Component (sidebar)
// =============================================================================

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
	return (
		<a
			href={href}
			className="block body-2 text-muted hover:text-base py-4 px-12 rounded-sm hover:bg-muted-transparent transition-colors"
		>
			{children}
		</a>
	);
}
