// Local-only fixture service. No production credentials or database access.
import http from "node:http";
export const parentId = "00000000-0000-4000-8000-000000000001";
let child = null;
let failSave = false;
const user = {
  id: parentId,
  aud: "authenticated",
  role: "authenticated",
  email: "parent@example.test",
  email_confirmed_at: "2026-01-01T00:00:00Z",
  app_metadata: { provider: "email" },
  user_metadata: {},
  created_at: "2026-01-01T00:00:00Z",
};
const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PATCH,DELETE,OPTIONS",
  );
  res.setHeader("Content-Type", "application/json");
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }
  let raw = "";
  for await (const chunk of req) raw += chunk;
  const data = raw ? JSON.parse(raw) : {};
  const url = new URL(req.url, "http://localhost");
  const send = (body, status = 200) => {
    res.writeHead(status);
    res.end(JSON.stringify(body));
  };
  if (url.pathname === "/__reset") {
    child = data.child ?? null;
    failSave = data.failSave ?? false;
    return send({ ok: true });
  }
  if (url.pathname === "/__state") return send({ child });
  if (url.pathname === "/auth/v1/user") return send(user);
  if (url.pathname === "/rest/v1/parents")
    return send(req.method === "GET" ? [{ name: "Jordan" }] : null);
  if (url.pathname === "/rest/v1/children") {
    if (req.method === "POST" || req.method === "PATCH") {
      if (failSave) return send({ message: "Fixture save failure" }, 500);
      child = {
        ...(child ?? {}),
        ...data,
        id: "00000000-0000-4000-8000-000000000002",
        parent_id: parentId,
        summary: child?.summary ?? "",
        strengths: [],
        growth_areas: [],
        learning_patterns: [],
        weekly_goals: null,
      };
      return send(null);
    }
    return send(child ? [child] : []);
  }
  if (url.pathname.startsWith("/rest/v1/")) return send([]);
  send({ ok: true });
});
server.listen(54321, "127.0.0.1", () =>
  console.log("Local fixture service ready"),
);
