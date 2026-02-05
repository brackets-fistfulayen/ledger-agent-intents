import { createFileRoute } from "@tanstack/react-router";
import { Button, Tag } from "@ledgerhq/lumen-ui-react";
import { useEffect, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLedger } from "@/lib/ledger-provider";
import {
	generateAgentKeyPair,
	buildAgentCredentialFile,
	downloadAgentCredential,
	type AgentKeyMaterial,
} from "@/lib/agent-keys";
import { agentsQueryOptions, useRegisterAgent, useRevokeAgent } from "@/queries/agents";
import { cn, formatAddress, formatTimeAgo } from "@/lib/utils";
import { Spinner } from "@/components/ui/Spinner";
import type { TrustchainMember } from "@agent-intents/shared";

export const Route = createFileRoute("/settings")({
	component: SettingsPage,
});

// =============================================================================
// Theme helpers
// =============================================================================

type Theme = "light" | "dark" | "system";

function getSystemTheme(): "light" | "dark" {
	if (typeof window !== "undefined") {
		return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
	}
	return "dark";
}

function applyTheme(theme: Theme) {
	const root = document.documentElement;
	const effectiveTheme = theme === "system" ? getSystemTheme() : theme;

	if (effectiveTheme === "dark") {
		root.classList.add("dark");
		root.style.colorScheme = "dark";
	} else {
		root.classList.remove("dark");
		root.style.colorScheme = "light";
	}
}

// =============================================================================
// Main Page
// =============================================================================

function SettingsPage() {
	const [theme, setTheme] = useState<Theme>(() => {
		if (typeof window !== "undefined") {
			return (localStorage.getItem("theme") as Theme) || "dark";
		}
		return "dark";
	});

	useEffect(() => {
		applyTheme(theme);
		localStorage.setItem("theme", theme);
	}, [theme]);

	useEffect(() => {
		if (theme !== "system") return;
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const handleChange = () => applyTheme("system");
		mediaQuery.addEventListener("change", handleChange);
		return () => mediaQuery.removeEventListener("change", handleChange);
	}, [theme]);

	return (
		<div className="flex flex-col gap-32">
			{/* Page header */}
			<div className="flex flex-col gap-8 text-center">
				<h1 className="heading-0-semi-bold text-base">Settings</h1>
				<p className="body-1 text-muted">Configure your preferences</p>
			</div>

			{/* Theme selector */}
			<div className="flex flex-col gap-16">
				<div className="rounded-lg bg-surface p-24">
					<div className="flex flex-col gap-16">
						<div className="flex flex-col gap-4">
							<h2 className="heading-5-semi-bold text-base">Appearance</h2>
							<p className="body-2 text-muted">Choose how the app looks</p>
						</div>

						<div className="flex gap-12">
							<Button
								appearance={theme === "light" ? "base" : "gray"}
								size="md"
								onClick={() => setTheme("light")}
							>
								Light
							</Button>
							<Button
								appearance={theme === "dark" ? "base" : "gray"}
								size="md"
								onClick={() => setTheme("dark")}
							>
								Dark
							</Button>
							<Button
								appearance={theme === "system" ? "base" : "gray"}
								size="md"
								onClick={() => setTheme("system")}
							>
								System
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Agent Management */}
			<AgentManagementSection />
		</div>
	);
}

// =============================================================================
// Agent Management Section
// =============================================================================

function AgentManagementSection() {
	const { account, isConnected } = useLedger();
	const trustchainId = account?.toLowerCase() ?? null;

	const { data: agents, isLoading } = useQuery(agentsQueryOptions(trustchainId));

	const [showProvision, setShowProvision] = useState(false);

	if (!isConnected) {
		return (
			<div className="rounded-lg bg-surface p-24">
				<div className="flex flex-col gap-16">
					<div className="flex flex-col gap-4">
						<h2 className="heading-5-semi-bold text-base">Agent Keys</h2>
						<p className="body-2 text-muted">
							Connect your Ledger to manage agent credentials
						</p>
					</div>
					<div className="flex items-center justify-center rounded-md bg-canvas-muted p-32">
						<p className="body-2 text-muted">
							Connect your wallet to view and manage agent keys
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-16">
			<div className="rounded-lg bg-surface p-24">
				<div className="flex flex-col gap-16">
					<div className="flex items-center justify-between">
						<div className="flex flex-col gap-4">
							<h2 className="heading-5-semi-bold text-base">Agent Keys</h2>
							<p className="body-2 text-muted">
								Provision and manage agent credentials linked to your identity
							</p>
						</div>
						{!showProvision && (
							<Button
								appearance="accent"
								size="md"
								onClick={() => setShowProvision(true)}
							>
								New Agent Key
							</Button>
						)}
					</div>

					{/* Provision form */}
					{showProvision && (
						<ProvisionAgentForm
							trustchainId={trustchainId!}
							onClose={() => setShowProvision(false)}
						/>
					)}

					{/* Agent list */}
					{isLoading ? (
						<div className="flex items-center justify-center py-24">
							<Spinner size="md" />
						</div>
					) : agents && agents.length > 0 ? (
						<AgentList agents={agents} />
					) : (
						<div className="flex items-center justify-center rounded-md bg-canvas-muted p-24">
							<p className="body-2 text-muted">
								No agents provisioned yet. Create one to get started.
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

// =============================================================================
// Provision Agent Form
// =============================================================================

type ProvisionStep = "label" | "generating" | "download";

function ProvisionAgentForm(props: {
	trustchainId: string;
	onClose: () => void;
}) {
	const { trustchainId, onClose } = props;

	const [step, setStep] = useState<ProvisionStep>("label");
	const [label, setLabel] = useState("");
	const [keyMaterial, setKeyMaterial] = useState<AgentKeyMaterial | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [downloaded, setDownloaded] = useState(false);

	const registerAgent = useRegisterAgent();

	const handleGenerate = useCallback(async () => {
		setError(null);
		setStep("generating");

		try {
			// 1. Generate LKRP keypair (secp256k1 via NobleCryptoService)
			const km = await generateAgentKeyPair();
			setKeyMaterial(km);

			// 2. Register on backend (no separate signature needed)
			await registerAgent.mutateAsync({
				trustChainId: trustchainId,
				agentLabel: label || "Unnamed Agent",
				agentPublicKey: km.publicKeyHex,
			});

			setStep("download");
		} catch (err) {
			const message = err instanceof Error ? err.message : "Failed to provision agent";
			setError(message);
			setStep("label");
		}
	}, [trustchainId, label, registerAgent]);

	const handleDownload = useCallback(() => {
		if (!keyMaterial) return;

		const credential = buildAgentCredentialFile({
			label: label || "Unnamed Agent",
			trustchainId,
			privateKeyHex: keyMaterial.privateKeyHex,
			publicKeyHex: keyMaterial.publicKeyHex,
		});

		downloadAgentCredential(credential);
		setDownloaded(true);
	}, [keyMaterial, label, trustchainId]);

	return (
		<div className="rounded-md border border-muted p-20">
			{/* Step: Enter label */}
			{step === "label" && (
				<div className="flex flex-col gap-16">
					<div className="flex flex-col gap-4">
						<h3 className="body-1-semi-bold text-base">Provision New Agent</h3>
						<p className="body-2 text-muted">
							Give your agent a name. A new LKRP keypair will be generated and
							registered under your identity.
						</p>
					</div>

					{error && (
						<div className="rounded-sm bg-error-strong/25 px-12 py-8">
							<p className="body-3 text-error">{error}</p>
						</div>
					)}

					<div className="flex flex-col gap-6">
						<label htmlFor="agent-label" className="body-2-semi-bold text-base">
							Agent Name
						</label>
						<input
							id="agent-label"
							type="text"
							placeholder="e.g. Auto-Compounder Bot"
							value={label}
							onChange={(e) => setLabel(e.target.value)}
							className="rounded-sm border border-muted bg-canvas px-12 py-8 body-2 text-base placeholder:text-muted-subtle outline-none focus:border-focus"
						/>
					</div>

					<div className="flex gap-12 justify-end">
						<Button appearance="gray" size="md" onClick={onClose}>
							Cancel
						</Button>
						<Button appearance="accent" size="md" onClick={handleGenerate}>
							Generate Key
						</Button>
					</div>
				</div>
			)}

			{/* Step: Generating */}
			{step === "generating" && (
				<div className="flex flex-col items-center gap-16 py-16">
					<Spinner size="lg" />
					<div className="flex flex-col items-center gap-4">
						<p className="body-1-semi-bold text-base">Generating agent key</p>
						<p className="body-2 text-muted">
							Creating LKRP keypair and registering with backend...
						</p>
					</div>
				</div>
			)}

			{/* Step: Download credential */}
			{step === "download" && keyMaterial && (
				<div className="flex flex-col gap-16">
					<div className="flex flex-col gap-4">
						<h3 className="body-1-semi-bold text-success">Agent Registered</h3>
						<p className="body-2 text-muted">
							Download the agent credential file below. It contains the private key
							needed for your agent to authenticate.
						</p>
					</div>

					<div className="rounded-sm bg-canvas-muted p-16">
						<div className="flex flex-col gap-12">
							<div className="flex flex-col gap-4">
								<span className="body-3 text-muted">Agent Public Key</span>
								<code className="body-2 text-base break-all">
									{keyMaterial.publicKeyHex}
								</code>
							</div>
						</div>
					</div>

					<div className="rounded-sm border border-warning bg-warning-strong/10 p-12">
						<p className="body-3 text-warning">
							Download the credential file and store it securely in your agent's
							configuration. The private key will not be recoverable after you close
							this dialog. If lost, revoke this key and create a new one.
						</p>
					</div>

					<div className="flex gap-12 justify-end">
						<Button appearance="accent" size="md" onClick={handleDownload}>
							{downloaded ? "Download Again" : "Download Credential"}
						</Button>
						<Button
							appearance={downloaded ? "base" : "gray"}
							size="md"
							onClick={onClose}
							disabled={!downloaded}
						>
							Done
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}

// =============================================================================
// Agent List
// =============================================================================

function AgentList({ agents }: { agents: TrustchainMember[] }) {
	return (
		<div className="flex flex-col gap-8">
			{agents.map((agent) => (
				<AgentRow key={agent.id} agent={agent} />
			))}
		</div>
	);
}

function AgentRow({ agent }: { agent: TrustchainMember }) {
	const revokeAgent = useRevokeAgent();
	const isRevoked = agent.revokedAt !== null;
	const [confirming, setConfirming] = useState(false);

	const handleRevoke = useCallback(async () => {
		if (!confirming) {
			setConfirming(true);
			return;
		}
		await revokeAgent.mutateAsync(agent.id);
		setConfirming(false);
	}, [confirming, agent.id, revokeAgent]);

	return (
		<div
			className={cn(
				"flex items-center justify-between rounded-sm border p-16",
				isRevoked ? "border-muted-subtle opacity-60" : "border-muted",
			)}
		>
			<div className="flex flex-col gap-4 min-w-0">
				<div className="flex items-center gap-8">
					<span className="body-2-semi-bold text-base truncate">
						{agent.label || "Unnamed Agent"}
					</span>
					{isRevoked ? (
						<Tag appearance="error" size="sm" label="Revoked" />
					) : (
						<Tag appearance="success" size="sm" label="Active" />
					)}
				</div>
				<div className="flex items-center gap-8">
					<code className="body-3 text-muted">
						{agent.memberPubkey.length > 20
							? `${agent.memberPubkey.slice(0, 10)}...${agent.memberPubkey.slice(-8)}`
							: agent.memberPubkey}
					</code>
					<span className="body-3 text-muted-subtle">
						Created {formatTimeAgo(agent.createdAt)}
					</span>
				</div>
			</div>

			{!isRevoked && (
				<Button
					appearance={confirming ? "red" : "gray"}
					size="sm"
					onClick={handleRevoke}
					disabled={revokeAgent.isPending}
				>
					{revokeAgent.isPending
						? "Revoking..."
						: confirming
							? "Confirm Revoke"
							: "Revoke"}
				</Button>
			)}
		</div>
	);
}
