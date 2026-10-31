// Isolated HTTP contract fixture for Playwright. NEVER used by the app or deployed.
// It simulates Supabase responses; passing these tests is NOT a live Supabase/RLS audit.
import { createServer } from "node:http";
import { generateKeyPairSync, randomUUID, sign, verify } from "node:crypto";
const port = 54329,
  origin = `http://127.0.0.1:${port}`,
  key = "math90-test-publishable-key";
const { publicKey, privateKey } = generateKeyPairSync("ec", {
    namedCurve: "prime256v1",
  }),
  kid = randomUUID();
const jwk = {
  ...publicKey.export({ format: "jwk" }),
  kid,
  alg: "ES256",
  use: "sig",
};
const users = new Map(),
  progress = new Map(),
  refreshTokens = new Map(),
  revoked = new Set();
const encode = (value) =>
  Buffer.from(JSON.stringify(value)).toString("base64url");
function issue(user) {
  const now = Math.floor(Date.now() / 1000),
    sessionId = randomUUID();
  const body = `${encode({ alg: "ES256", typ: "JWT", kid })}.${encode({ sub: user.id, email: user.email, aud: "authenticated", role: "authenticated", iss: `${origin}/auth/v1`, iat: now, exp: now + 3600, session_id: sessionId })}`;
  const token = `${body}.${sign("sha256", Buffer.from(body), { key: privateKey, dsaEncoding: "ieee-p1363" }).toString("base64url")}`,
    refresh = randomUUID();
  refreshTokens.set(refresh, user);
  return {
    access_token: token,
    refresh_token: refresh,
    expires_in: 3600,
    expires_at: now + 3600,
    token_type: "bearer",
    user,
  };
}
function authenticate(request) {
  try {
    const token = request.headers.authorization?.replace(/^Bearer /, "");
    if (!token) return null;
    const [header, payload, signature] = token.split(".");
    if (
      !signature ||
      !verify(
        "sha256",
        Buffer.from(`${header}.${payload}`),
        { key: publicKey, dsaEncoding: "ieee-p1363" },
        Buffer.from(signature, "base64url"),
      )
    )
      return null;
    const claims = JSON.parse(Buffer.from(payload, "base64url"));
    if (claims.exp < Date.now() / 1000 || revoked.has(claims.session_id))
      return null;
    return {
      ...claims,
      user: [...users.values()].find((u) => u.id === claims.sub),
    };
  } catch {
    return null;
  }
}
const server = createServer(async (request, response) => {
  function json(status, data) {
    response.writeHead(status, {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    });
    response.end(JSON.stringify(data));
  }
  try {
    const url = new URL(request.url, origin);
    if (url.pathname === "/health") return json(200, { fixture: true });
    if (request.headers.apikey !== key)
      return json(401, { message: "Invalid fixture key" });
    if (url.pathname === "/auth/v1/.well-known/jwks.json")
      return json(200, { keys: [jwk] });
    let body = "";
    for await (const chunk of request) body += chunk;
    if (body.length > 1000000) return json(413, { message: "Too large" });
    const input = body ? JSON.parse(body) : {};
    if (url.pathname === "/auth/v1/signup") {
      if (users.has(input.email))
        return json(400, {
          code: "user_already_exists",
          msg: "Account already registered",
        });
      const user = {
        id: randomUUID(),
        email: input.email,
        password: input.password,
        aud: "authenticated",
        role: "authenticated",
        email_confirmed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        app_metadata: { provider: "email" },
        user_metadata: {},
        identities: [],
      };
      users.set(user.email, user);
      const session = issue({ ...user });
      delete session.user.password;
      return json(200, session);
    }
    if (url.pathname === "/auth/v1/token") {
      const user =
        url.searchParams.get("grant_type") === "refresh_token"
          ? refreshTokens.get(input.refresh_token)
          : users.get(input.email);
      if (
        !user ||
        (url.searchParams.get("grant_type") !== "refresh_token" &&
          user.password !== input.password)
      )
        return json(400, {
          code: "invalid_credentials",
          msg: "Invalid login credentials",
        });
      const session = issue({ ...user });
      delete session.user.password;
      return json(200, session);
    }
    const claims = authenticate(request);
    if (!claims?.user)
      return json(401, { code: "bad_jwt", message: "Authentication required" });
    if (url.pathname === "/auth/v1/user") {
      const user = { ...claims.user };
      delete user.password;
      return json(200, user);
    }
    if (url.pathname === "/auth/v1/logout") {
      revoked.add(claims.session_id);
      return json(200, {});
    }
    if (url.pathname === "/rest/v1/learning_progress") {
      const owner = claims.sub,
        existing = progress.get(owner),
        filter = url.searchParams.get("user_id");
      const represent = (row) =>
        request.headers.accept?.includes("application/vnd.pgrst.object+json")
          ? (row ?? null)
          : row
            ? [row]
            : [];
      if (filter && filter !== `eq.${owner}`) return json(200, represent(null));
      if (request.method === "GET") return json(200, represent(existing));
      if (input.user_id !== owner || input.state?.profileId !== owner)
        return json(403, {
          code: "42501",
          message: "Row-level ownership failed",
        });
      if (request.method === "POST") {
        if (existing) return json(409, { code: "23505", message: "Duplicate" });
        progress.set(owner, input);
        return json(201, represent(input));
      }
      if (request.method === "PATCH") {
        if (
          !existing ||
          url.searchParams.get("revision") !== `eq.${existing.revision}`
        )
          return json(200, represent(null));
        progress.set(owner, input);
        return json(200, represent(input));
      }
    }
    return json(404, { message: "Fixture endpoint not implemented" });
  } catch {
    return json(500, { message: "Fixture request failed" });
  }
});
server.listen(port, "127.0.0.1", () =>
  console.log(`Supabase HTTP TEST FIXTURE ready at ${origin}`),
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => server.close(() => process.exit(0)));
