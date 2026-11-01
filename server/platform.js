const crypto = require("node:crypto");
const equal = (a, b) =>
  crypto.timingSafeEqual(
    crypto
      .createHash("sha256")
      .update(a || "")
      .digest(),
    crypto
      .createHash("sha256")
      .update(b || "")
      .digest(),
  );
const configuration = () => ({
  url: (process.env.SUPABASE_URL || "").replace(/\/$/, ""),
  publicKey: process.env.SUPABASE_ANON_KEY || "",
  secret: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
});
async function rest(
  path,
  { method = "GET", body, token, admin = true, headers = {} } = {},
) {
  const c = configuration();
  if (!c.url || !c.publicKey || (admin && !c.secret))
    throw Error("not_configured");
  const r = await fetch(c.url + path, {
    method,
    headers: {
      apikey: admin ? c.secret : c.publicKey,
      Authorization: "Bearer " + (token || (admin ? c.secret : c.publicKey)),
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(25000),
  });
  if (!r.ok) {
    const e = Error("database_request");
    e.status = r.status;
    throw e;
  }
  if (r.status === 204) return null;
  const text = await r.text();
  return text ? JSON.parse(text) : null;
}
async function user(token) {
  if (!token || token.length > 5000) throw Error("unauthorized");
  try {
    const d = await rest("/auth/v1/user", { token, admin: false });
    if (!d?.id) throw Error();
    return d;
  } catch {
    throw Error("unauthorized");
  }
}
async function reserve(userId) {
  const d = await rest("/rest/v1/rpc/psy_reserve_generation", {
    method: "POST",
    body: { target_user: userId, max_daily: 5 },
  });
  return d === true;
}
module.exports = { configuration, rest, user, reserve, equal };
