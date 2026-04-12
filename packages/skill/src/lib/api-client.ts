import type {
	CreateIntentRequest,
	CreateIntentResponse,
	Intent,
	IntentStatus,
} from "@agent-intents/shared";
import { buildAgentAuthHeader } from "./agent-auth.js";
import type { AgentCredentialFile } from "./credential.js";
import { CLIError } from "./errors.js";

interface ApiClientConfig {
	baseUrl: string;
	credential: AgentCredentialFile;
}

interface IntentListResponse {
	success: boolean;
	intents?: Intent[];
	nextCursor?: string;
	error?: string;
}

interface IntentResponse {
	success: boolean;
	intent?: Intent;
	error?: string;
}

interface HealthResponse {
	status: string;
	db: string;
	timestamp: string;
}

export class IntentApiClient {
	private baseUrl: string;
	private privateKey: `0x${string}`;
	private trustchainId: string;

	constructor(config: ApiClientConfig) {
		this.baseUrl = config.baseUrl.replace(/\/+$/, "");
		this.privateKey = config.credential.privateKey as `0x${string}`;
		this.trustchainId = config.credential.trustchainId;
	}

	/** POST /api/intents */
	async createIntent(req: CreateIntentRequest): Promise<CreateIntentResponse> {
		const body = JSON.stringify(req);
		const authHeader = await buildAgentAuthHeader(this.privateKey, "POST", body);

		const res = await this.fetch("/api/intents", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: authHeader,
			},
			body,
		});

		return this.parseJson<CreateIntentResponse>(res);
	}

	/** GET /api/intents/:id */
	async getIntent(id: string): Promise<IntentResponse> {
		const authHeader = await buildAgentAuthHeader(this.privateKey, "GET");

		const res = await this.fetch(`/api/intents/${id}`, {
			headers: { Authorization: authHeader },
		});

		return this.parseJson<IntentResponse>(res);
	}

	async listIntents(opts?: {
		status?: IntentStatus;
		limit?: number;
	}): Promise<IntentListResponse> {
		const params = new URLSearchParams();
		if (opts?.status) params.set("status", opts.status);
		if (opts?.limit) params.set("limit", String(opts.limit));

		const qs = params.toString();
		const path = `/api/intents${qs ? `?${qs}` : ""}`;
		const authHeader = await buildAgentAuthHeader(this.privateKey, "GET");

		const res = await this.fetch(path, {
			headers: { Authorization: authHeader },
		});

		return this.parseJson<IntentListResponse>(res);
	}

	/** POST /api/intents/status */
	async updateStatus(
		id: string,
		status: IntentStatus,
		opts?: { note?: string; txHash?: string },
	): Promise<IntentResponse> {
		const payload = { id, status, ...opts };
		const body = JSON.stringify(payload);
		const authHeader = await buildAgentAuthHeader(this.privateKey, "POST", body);

		const res = await this.fetch("/api/intents/status", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: authHeader,
			},
			body,
		});

		return this.parseJson<IntentResponse>(res);
	}

	/** GET /api/health (no auth) */
	async health(): Promise<HealthResponse> {
		const res = await this.fetch("/api/health");
		return this.parseJson<HealthResponse>(res);
	}

	private async fetch(path: string, init?: RequestInit): Promise<Response> {
		const url = `${this.baseUrl}${path}`;
		try {
			return await globalThis.fetch(url, init);
		} catch (err) {
			throw new CLIError(
				`Failed to connect to ${this.baseUrl}: ${err instanceof Error ? err.message : String(err)}`,
			);
		}
	}

	private async parseJson<T>(res: Response): Promise<T> {
		const contentType = res.headers.get("content-type") ?? "";
		if (!contentType.includes("application/json")) {
			const text = await res.text();
			throw new CLIError(
				`Expected JSON from API but got ${contentType || "no content-type"}. Status: ${res.status}\n${text.slice(0, 200)}`,
			);
		}

		const data = (await res.json()) as T;

		if (!res.ok) {
			const errorData = data as { error?: string };
			throw new CLIError(errorData.error ?? `API error: ${res.status} ${res.statusText}`);
		}

		return data;
	}
}
