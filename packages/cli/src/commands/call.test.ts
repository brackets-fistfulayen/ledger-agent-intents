import { describe, expect, it } from "vitest";
import { parseCallArgs } from "./call.js";

const VALID_ADDRESS = "0x1234567890abcdef1234567890abcdef12345678";
const VALID_CALLDATA = "0xa9059cbb000000000000000000000000abcdef";

describe("parseCallArgs", () => {
	it("parses basic contract call", () => {
		const result = parseCallArgs([VALID_ADDRESS, VALID_CALLDATA]);
		expect(result.to).toBe(VALID_ADDRESS);
		expect(result.data).toBe(VALID_CALLDATA);
		expect(result.chainId).toBe(8453);
		expect(result.urgency).toBe("normal");
		expect(result.value).toBeUndefined();
		expect(result.memo).toBeUndefined();
	});

	it("parses with all options", () => {
		const result = parseCallArgs([
			VALID_ADDRESS,
			VALID_CALLDATA,
			"--value",
			"1000000000000000000",
			"--memo",
			"swap tokens",
			"--chain",
			"84532",
			"--urgency",
			"high",
		]);
		expect(result.value).toBe("1000000000000000000");
		expect(result.memo).toBe("swap tokens");
		expect(result.chainId).toBe(84532);
		expect(result.urgency).toBe("high");
	});

	it("throws on missing arguments", () => {
		expect(() => parseCallArgs([])).toThrow();
		expect(() => parseCallArgs([VALID_ADDRESS])).toThrow();
	});

	it("throws on invalid contract address", () => {
		expect(() => parseCallArgs(["not-an-address", VALID_CALLDATA])).toThrow(
			"Invalid contract address",
		);
	});

	it("throws on invalid calldata hex", () => {
		expect(() => parseCallArgs([VALID_ADDRESS, "not-hex"])).toThrow("Invalid calldata hex");
	});

	it("throws on calldata shorter than function selector", () => {
		expect(() => parseCallArgs([VALID_ADDRESS, "0xabcd"])).toThrow("function selector");
	});

	it("throws on unsupported chain", () => {
		expect(() => parseCallArgs([VALID_ADDRESS, VALID_CALLDATA, "--chain", "1"])).toThrow(
			"Unsupported chain",
		);
	});
});
