import { type TypedData } from "@ledgerhq/device-signer-kit-ethereum";

export type SignTypedMessageParams = [string, TypedData, string];

const SUPPORTED_METHODS = ["eth_signTypedData", "eth_signTypedData_v4"];

function isTypedData(value: unknown): value is TypedData {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  if (
    !("types" in value) ||
    !("primaryType" in value) ||
    !("domain" in value) ||
    !("message" in value)
  ) {
    return false;
  }

  return true;
}

export function isSignTypedMessageParams(
  params: unknown,
): params is SignTypedMessageParams {
  if (!Array.isArray(params) || params.length !== 3) {
    return false;
  }

  const [address, typedData, method] = params;

  const hasValidAddress = typeof address === "string";
  const hasValidTypedData = isTypedData(typedData);
  const hasValidMethod =
    typeof method === "string" && SUPPORTED_METHODS.includes(method);

  return hasValidAddress && hasValidTypedData && hasValidMethod;
}
