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
					"Quickstart guide for AI agents to create payment intents using a JSON credential file.",
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
							Getting Started
						</h4>
						<NavLink href="#credential-file">Credential File</NavLink>
						<NavLink href="#agentauth-header">AgentAuth Header</NavLink>
						<NavLink href="#send-intent">Send an Intent</NavLink>
						<NavLink href="#poll">Poll for Completion</NavLink>
					</div>
					<div>
						<h4 className="body-4-semi-bold text-muted-subtle uppercase tracking-wider mb-8 px-12">
							Example
						</h4>
						<NavLink href="#complete-example">Complete Bash Script</NavLink>
					</div>
					<div>
						<h4 className="body-4-semi-bold text-muted-subtle uppercase tracking-wider mb-8 px-12">
							Reference
						</h4>
						<NavLink href="#supported-chains">Supported Chains</NavLink>
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
							← Back to App
						</Link>
					</div>
					<div>
						<h1 className="heading-2-semi-bold text-base">Context for Agents</h1>
						<p className="body-1 text-muted mt-8">
							Quickstart guide for AI agents to create payment intents using a JSON credential file.
						</p>
					</div>
					<div className="flex items-center gap-16 p-16 rounded-md bg-accent/10">
						<p className="body-2 text-base">
							<strong>Prerequisites:</strong>{" "}
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
							<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">jq</code>.
						</p>
					</div>
				</div>

				{/* 1. Credential File */}
				<Section id="credential-file" title="1. Credential File">
					<p className="body-2 text-muted">
						You need a JSON credential file with this shape. The human owner generates this file
						when registering your agent from the web UI.
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
				<Section id="agentauth-header" title="2. Build the AgentAuth Header">
					<p className="body-2 text-muted">
						Every request to the API requires an{" "}
						<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">Authorization</code>{" "}
						header:
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
										Current Unix epoch in <strong>seconds</strong> as a string (must be within 5 min
										of server time)
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
										— returns{" "}
										<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">0x</code>
										-prefixed keccak256 hash. For GET requests (no body), use the literal string{" "}
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
										<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">
											{'cast wallet sign --private-key "$KEY" "$MESSAGE"'}
										</code>{" "}
										— EIP-191{" "}
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

					<div className="p-16 rounded-md bg-accent/10">
						<p className="body-2 text-base">
							<strong>Important:</strong> All hex values (
							<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">bodyHash</code>,{" "}
							<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">signature</code>){" "}
							<strong>must</strong> include the{" "}
							<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">0x</code> prefix.
							Omitting it will result in a{" "}
							<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">
								401 Authentication failed
							</code>{" "}
							error.
						</p>
					</div>

					<h3 className="heading-5-semi-bold text-base mt-24">Body hashing</h3>
					<p className="body-2 text-muted">
						The <code className="px-4 py-2 rounded-xs bg-muted text-base body-3">bodyHash</code> is
						computed over the <strong>exact bytes</strong> sent in the request body. Write the JSON
						body as a compact literal string (no extra whitespace between keys and values) to ensure
						a deterministic hash.
					</p>
				</Section>

				{/* 3. Send an Intent */}
				<Section id="send-intent" title="3. Send an Intent">
					<p className="body-2 text-muted">
						<strong>
							<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">
								POST https://www.agentintents.io/api/intents
							</code>
						</strong>
					</p>

					<h3 className="heading-5-semi-bold text-base">Request body</h3>
					<CodeBlock language="json" title="Compact JSON body">
						{
							'{"agentId":"my-agent","agentName":"My Agent","details":{"type":"transfer","token":"USDC","amount":"1.00","recipient":"0xRecipientAddress","chainId":8453,"memo":"Reason for payment"},"urgency":"normal","expiresInMinutes":60}'
						}
					</CodeBlock>

					<h3 className="heading-5-semi-bold text-base">Response (201 Created)</h3>
					<CodeBlock language="json" title="Response">
						{`{
  "success": true,
  "intent": {
    "id": "int_1770399036079_804497de",
    "userId": "0x20bfb083c5adacc91c46ac4d37905d0447968166",
    "agentId": "my-agent",
    "agentName": "My Agent",
    "details": { "..." : "..." },
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
}`}
					</CodeBlock>

					<p className="body-2 text-muted">
						Share the{" "}
						<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">paymentUrl</code> with
						the human so they can review and sign the transaction.
					</p>
				</Section>

				{/* 4. Poll for Completion */}
				<Section id="poll" title="4. Poll for Completion">
					<p className="body-2 text-muted">
						<strong>
							<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">
								{"GET https://www.agentintents.io/api/intents/<intent-id>"}
							</code>
						</strong>
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

				{/* Complete Example */}
				<Section id="complete-example" title="Complete Example">
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
							<strong>Tip:</strong>{" "}
							<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">cast keccak</code>{" "}
							and{" "}
							<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">
								cast wallet sign
							</code>{" "}
							both return <code className="px-4 py-2 rounded-xs bg-muted text-base body-3">0x</code>
							-prefixed output — no manual hex formatting needed.
						</p>
					</div>
				</Section>

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
									<td className="py-8">Mainnet</td>
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
										Ensure{" "}
										<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">bodyHash</code>{" "}
										and{" "}
										<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">
											signature
										</code>{" "}
										are <code className="px-4 py-2 rounded-xs bg-muted text-base body-3">0x</code>
										-prefixed hex strings
									</td>
								</tr>
								<tr className="border-b border-muted/50">
									<td className="py-8 pr-16">
										<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">
											401 Authentication failed
										</code>
									</td>
									<td className="py-8 pr-16">Timestamp drift</td>
									<td className="py-8">
										Ensure your system clock is accurate (within 5 minutes of server time)
									</td>
								</tr>
								<tr className="border-b border-muted/50">
									<td className="py-8 pr-16">
										<code className="px-4 py-2 rounded-xs bg-muted text-base body-3">
											401 Authentication failed
										</code>
									</td>
									<td className="py-8 pr-16">Body hash mismatch</td>
									<td className="py-8">
										Ensure you hash the <strong>exact</strong> bytes sent as the request body
										(compact JSON, no trailing newline)
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
								This page as JSON:{" "}
								<a href="/agent-context.json" className="text-accent hover:underline">
									/agent-context.json
								</a>
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
