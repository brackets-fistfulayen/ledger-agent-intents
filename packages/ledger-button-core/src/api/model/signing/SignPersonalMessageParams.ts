export type SignPersonalMessageParams = [string, string | Uint8Array, string];

export function isSignPersonalMessageParams(
  params: unknown,
): params is SignPersonalMessageParams {
  return (
    !!params &&
    Array.isArray(params) &&
    params.length === 3 &&
    typeof params[0] === "string" &&
    (typeof params[1] === "string" || params[1] instanceof Uint8Array) &&
    typeof params[2] === "string" &&
    (params[2] === "eth_sign" || params[2] === "personal_sign")
  );
}
