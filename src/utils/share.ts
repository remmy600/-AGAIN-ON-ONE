import { CustomCardData } from "../types";

export function encodeCardData(data: CustomCardData): string {
  try {
    const jsonStr = JSON.stringify(data);
    // Base64 encode after handling UTF-8 safely
    const utf8Bytes = new TextEncoder().encode(jsonStr);
    let binary = "";
    const len = utf8Bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(utf8Bytes[i]);
    }
    return btoa(binary);
  } catch (error) {
    console.error("Failed to encode card data:", error);
    return "";
  }
}

export function decodeCardData(payload: string): CustomCardData | null {
  try {
    const binary = atob(payload);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const jsonStr = new TextDecoder().decode(bytes);
    return JSON.parse(jsonStr) as CustomCardData;
  } catch (error) {
    console.error("Failed to decode card data:", error);
    return null;
  }
}
