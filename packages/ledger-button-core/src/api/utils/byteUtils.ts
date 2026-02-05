import { hexaStringToBuffer } from "@ledgerhq/device-management-kit";

export function hexToUtf8(hex: string) {
  const bytes = hexaStringToBuffer(hex);
  if (!bytes) {
    throw new Error("Invalid hex string");
  }

  const textDecoder = new TextDecoder("utf-8");
  return textDecoder.decode(bytes);
}
