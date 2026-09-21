import dns from "node:dns/promises";

export class UnsafeUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsafeUrlError";
  }
}

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "0.0.0.0",
  "metadata.google.internal",
]);

/** IPv4 ranges that must never be reachable from the crawler. */
function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return true; // fail closed
  const [a, b] = parts;

  if (a === 10) return true; // 10.0.0.0/8
  if (a === 127) return true; // loopback
  if (a === 169 && b === 254) return true; // link-local / cloud metadata (169.254.169.254)
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 192 && b === 168) return true; // 192.168.0.0/16
  if (a === 0) return true; // "this network"
  if (a === 100 && b >= 64 && b <= 127) return true; // carrier-grade NAT 100.64.0.0/10
  if (a >= 224) return true; // multicast + reserved
  return false;
}

function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  if (normalized === "::1") return true; // loopback
  if (normalized.startsWith("fe80:")) return true; // link-local
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true; // unique local fc00::/7
  if (normalized.startsWith("::ffff:")) {
    // IPv4-mapped IPv6 address, e.g. ::ffff:127.0.0.1
    const v4 = normalized.split(":").pop() ?? "";
    if (v4.includes(".")) return isPrivateIPv4(v4);
  }
  return false;
}

function isPrivateIp(ip: string): boolean {
  return ip.includes(":") ? isPrivateIPv6(ip) : isPrivateIPv4(ip);
}

export interface ValidatedUrl {
  url: URL;
  resolvedIps: string[];
}

/**
 * Validates that a URL is safe for the server to fetch:
 * - http/https only
 * - not a known-internal hostname
 * - all resolved IPs are public (blocks DNS-rebinding to private ranges)
 *
 * Call this again on every redirect hop, not just the initial URL.
 */
export async function validateOutboundUrl(rawUrl: string): Promise<ValidatedUrl> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new UnsafeUrlError("That is not a valid URL.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new UnsafeUrlError("Only http:// and https:// URLs are supported.");
  }

  const hostname = url.hostname.toLowerCase();
  if (BLOCKED_HOSTNAMES.has(hostname) || hostname.endsWith(".local") || hostname.endsWith(".internal")) {
    throw new UnsafeUrlError("This host cannot be analyzed.");
  }

  // If the hostname is already a literal IP, validate it directly.
  const literalIpPattern = /^[0-9.]+$/;
  const isLiteralIpv4 = literalIpPattern.test(hostname);
  const isLiteralIpv6 = hostname.includes(":");

  let resolvedIps: string[] = [];
  if (isLiteralIpv4 || isLiteralIpv6) {
    resolvedIps = [hostname.replace(/^\[|\]$/g, "")];
  } else {
    try {
      const records = await dns.lookup(hostname, { all: true, verbatim: true });
      resolvedIps = records.map((r) => r.address);
    } catch {
      throw new UnsafeUrlError("We couldn't resolve this domain.");
    }
  }

  if (resolvedIps.length === 0) {
    throw new UnsafeUrlError("We couldn't resolve this domain.");
  }

  if (resolvedIps.some(isPrivateIp)) {
    throw new UnsafeUrlError("This URL resolves to a private or internal network address and cannot be analyzed.");
  }

  return { url, resolvedIps };
}
