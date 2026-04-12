import { describe, expect, it } from "vitest";
import { parseSendArgs } from "./send.js";

describe("parseSendArgs", () => {
	it("parses basic send command", () => {
		const result = parseSendArgs([
			"50",
			"USDC",
			"to",
			"0x1234567890abcdef1234567890abcdef12345678",
		]);
		expect(result.amount).toBe("50");
		expect(result.token).toBe("USDC");
		expect(result.tokenAddress).toBe("0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913");
		expect(result.recipient).toBe("0x1234567890abcdef1234567890abcdef12345678");
		expect(result.chainId).toBe(8453); // default
		expect(result.urgency).toBe("normal"); // default
		expect(result.memo).toBeUndefined();
	});

	it("parses with memo, chain, and urgency", () => {
		const result = parseSendArgs([
			"0.01",
			"usdc",
			"to",
			"0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
			"for",
			'"podcast music"',
			"--chain",
			"84532",
			"--urgency",
			"high",
		]);
		expect(result.amount).toBe("0.01");
		expect(result.token).toBe("USDC"); // uppercased
		expect(result.chainId).toBe(84532);
		expect(result.urgency).toBe("high");
		expect(result.memo).toBe("podcast music");
	});

	it("throws on missing 'to' keyword", () => {
		expect(() => parseSendArgs(["50", "USDC"])).toThrow();
	});

	it("throws on invalid address", () => {
		expect(() => parseSendArgs(["50", "USDC", "to", "not-an-address"])).toThrow(
			"Invalid Ethereum address",
		);
	});

	it("throws on invalid amount", () => {
		expect(() =>
			parseSendArgs(["abc", "USDC", "to", "0x1234567890abcdef1234567890abcdef12345678"]),
		).toThrow("Invalid amount");
	});

	it("throws on unsupported chain", () => {
		expect(() =>
			parseSendArgs([
				"50",
				"USDC",
				"to",
				"0x1234567890abcdef1234567890abcdef12345678",
				"--chain",
				"1",
			]),
		).toThrow("Unsupported chain");
	});

	it("throws on unsupported token", () => {
		expect(() =>
			parseSendArgs(["50", "ETH", "to", "0x1234567890abcdef1234567890abcdef12345678"]),
		).toThrow("Unsupported token");
	});

	it("throws on invalid urgency", () => {
		expect(() =>
			parseSendArgs([
				"50",
				"USDC",
				"to",
				"0x1234567890abcdef1234567890abcdef12345678",
				"--urgency",
				"extreme",
			]),
		).toThrow("Invalid urgency");
	});
});
