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
		expect(result.recipient).toBe("0x1234567890abcdef1234567890abcdef12345678");
		expect(result.chainId).toBe(8453);
		expect(result.urgency).toBe("normal");
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
		expect(result.token).toBe("USDC");
		expect(result.chainId).toBe(84532);
		expect(result.urgency).toBe("high");
		expect(result.memo).toBe("podcast music");
	});

	it("accepts any token symbol (resolution happens in handleSend)", () => {
		const result = parseSendArgs(["1", "WETH", "to", "0x1234567890abcdef1234567890abcdef12345678"]);
		expect(result.token).toBe("WETH");
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
