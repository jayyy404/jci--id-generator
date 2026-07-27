import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "admin_session";
const TOKEN_VALUE = "admin";

function secret(): string {
  const value = process.env.ADMIN_PASSWORD;
  if (!value) throw new Error("ADMIN_PASSWORD is not set");
  return value;
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

// Stateless session: the cookie's value is just a fixed token signed with
// ADMIN_PASSWORD as the HMAC key. No database, no session store — anyone
// who knows the password can derive a valid cookie, which is exactly the
// point (shared-password admin access), and nobody else can forge one
// without the password.
export function createSessionCookieValue(): string {
  return `${TOKEN_VALUE}.${sign(TOKEN_VALUE)}`;
}

export function isValidSessionCookieValue(cookieValue: string | undefined): boolean {
  if (!cookieValue) return false;
  const [value, signature] = cookieValue.split(".");
  if (!value || !signature || value !== TOKEN_VALUE) return false;

  const expected = sign(value);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export { COOKIE_NAME };
