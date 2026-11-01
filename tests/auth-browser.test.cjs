const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { webcrypto, createHash } = require("node:crypto");
function harness() {
  const values = new Map(),
    local = new Map(),
    calls = [];
  const ctx = {
    URL,
    URLSearchParams,
    TextEncoder,
    Uint8Array,
    Date,
    JSON,
    crypto: webcrypto,
    btoa: (value) => Buffer.from(value, "binary").toString("base64"),
    sessionStorage: {
      getItem: (k) => values.get(k) || null,
      setItem: (k, v) => values.set(k, v),
      removeItem: (k) => values.delete(k),
    },
    localStorage: {
      getItem: (k) => local.get(k) || null,
      setItem: (k, v) => local.set(k, v),
      removeItem: (k) => local.delete(k),
    },
    Event: class {},
    window: { addEventListener() {}, dispatchEvent() {} },
    location: {
      origin: "https://bluefruit.test",
      pathname: "/account.html",
      search: "?lang=zh",
      hash: "",
      assign(url) {
        this.assigned = url;
      },
    },
    history: {
      replaceState(a, b, url) {
        const u = new URL(url, "https://bluefruit.test");
        ctx.location.search = u.search;
        ctx.location.hash = u.hash;
      },
    },
    tr: (zh, en) => zh,
    link: (p) => p + "?lang=zh",
    esc: (s) => s,
    fetch: async (url, options = {}) => {
      calls.push({ url, options });
      let data;
      if (url.startsWith("/api/platform"))
        data = {
          configured: true,
          url: "https://project.supabase.co",
          publicKey: "publishable-test",
          auth: { github: true, email: false },
        };
      else if (url.endsWith("/auth/v1/token?grant_type=pkce"))
        data = {
          access_token: "verified-jwt",
          refresh_token: "refresh-test",
          expires_in: 3600,
          user: { id: "wrong-input" },
          provider_token: "must-not-store-provider-token",
        };
      else if (url.endsWith("/auth/v1/user"))
        data = { id: "verified-user", email: "test@example.test" };
      else throw Error("Unexpected request");
      return new Response(JSON.stringify(data), { status: 200 });
    },
  };
  vm.createContext(ctx);
  vm.runInContext(
    fs
      .readFileSync("platform-cloud.js", "utf8")
      .replace(/^import .*;\n/gm, "")
      .replace(/^export /gm, ""),
    ctx,
  );
  return { ctx, values, local, calls };
}
test("GitHub sign-in uses a fresh PKCE verifier, exact callback, and no repository scopes", async () => {
  const { ctx, values } = harness();
  await ctx.githubSignIn();
  const url = new URL(ctx.location.assigned),
    proof = JSON.parse(values.get("psy-cloud-pkce-v1"));
  assert.equal(url.origin, "https://project.supabase.co");
  assert.equal(url.pathname, "/auth/v1/authorize");
  assert.equal(url.searchParams.get("provider"), "github");
  assert.equal(
    url.searchParams.get("redirect_to"),
    "https://bluefruit.test/account.html?lang=zh",
  );
  assert.equal(
    url.searchParams.get("code_challenge"),
    createHash("sha256").update(proof.verifier).digest("base64url"),
  );
  assert.equal(url.searchParams.get("code_challenge_method"), "s256");
  assert.equal(url.searchParams.has("scopes"), false);
  const first = proof.verifier;
  await ctx.githubSignIn();
  assert.notEqual(JSON.parse(values.get("psy-cloud-pkce-v1")).verifier, first);
});
test("callback exchanges only with local proof, clears URL and persists no provider credential", async () => {
  const { ctx, values, local, calls } = harness();
  await ctx.githubSignIn();
  const proof = JSON.parse(values.get("psy-cloud-pkce-v1"));
  ctx.location.search = "?lang=zh&code=one-use-code";
  assert.equal(await ctx.acceptAuthReturn(), true);
  assert.equal(ctx.location.search, "?lang=zh");
  assert.equal(values.has("psy-cloud-pkce-v1"), false);
  const exchange = calls.find((c) => c.url.endsWith("grant_type=pkce"));
  assert.deepEqual(JSON.parse(exchange.options.body), {
    auth_code: "one-use-code",
    code_verifier: proof.verifier,
  });
  const stored = JSON.parse(local.get("psy-cloud-session-v1"));
  assert.equal(stored.user.id, "verified-user");
  assert.equal(stored.provider_token, undefined);
  assert.equal(await ctx.acceptAuthReturn(), false);
});
test("missing, expired or failed callback never exchanges a code or imports a fragment token", async () => {
  for (const scenario of ["missing", "expired", "fragment", "error"]) {
    const { ctx, values, local, calls } = harness();
    ctx.location.search = "?code=untrusted";
    if (scenario === "expired")
      values.set(
        "psy-cloud-pkce-v1",
        JSON.stringify({
          verifier: "a".repeat(64),
          created: Date.now() - 700000,
        }),
      );
    if (scenario === "fragment") {
      ctx.location.search = "";
      ctx.location.hash = "#access_token=untrusted";
    }
    if (scenario === "error")
      ctx.location.search = "?error=access_denied&error_description=private";
    await assert.rejects(ctx.acceptAuthReturn());
    assert.equal(calls.length, 0);
    assert.equal(local.size, 0);
    assert.equal(ctx.location.hash, "");
    assert.equal(ctx.location.search, "");
  }
});
