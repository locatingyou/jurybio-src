import crypto from "crypto";

function hashIP(ip: string): string {
  const hash = crypto.createHash("sha256");
  hash.update(ip);
  return hash.digest("hex");
}

export { hashIP };
