// Local-only fixture service. No production credentials or database access.
import http from "node:http";
export const parentId = "00000000-0000-4000-8000-000000000001";
let child = null;
let failSave = false;
let sessions = [];
let skills = [];
let modelRequests = [];
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
    sessions = [];
    skills = [];
    modelRequests = [];
    return send({ ok: true });
  }
  if (url.pathname === "/__state") return send({ child, sessions, skills, modelRequests });
  if (url.pathname === "/v1/messages") {
    modelRequests.push(data);
    const result = data.max_tokens === 900
      ? {micro_message:"Objects helped. Next time, start with a group of ten.", updated_summary:"Maya is exploring teen numbers with objects.", skill_status:"getting there"}
      : {skill:"Counting toy dinosaurs", why_it_matters:"Make a ten and some extra ones.", is_new_concept:true, analogies:["Build a dinosaur family of ten and two more."], household_objects:["12 blocks"], followup_questions:["How many extra?", "Where is the ten?"], stuck_tip:"Start with ten blocks.", alternate_approach:"Draw ten dots and two more.", watch_for:"Pause if the objects become frustrating.", praise_phrase:"You kept trying.", autonomy_tip:"Let them choose the blocks.", real_life_connection:"Find groups at snack time.", estimated_minutes:"15–20", math_anxiety_note:"Take it one group at a time."};
    return send({id:"msg_fixture", type:"message", role:"assistant", model:data.model, content:[{type:"text",text:JSON.stringify(result)}],stop_reason:"end_turn", usage:{input_tokens:10,output_tokens:10}});
  }
  if (url.pathname === "/rest/v1/sessions") {
    if (req.method === "POST") {
      const row = {...data,id:`session-${sessions.length+1}`,created_at:new Date().toISOString()};
      sessions.unshift(row);
      return send(row);
    }
    return send(sessions);
  }
  if (url.pathname === "/rest/v1/skills") {
    if (req.method === "POST") { skills = [{...data,id:"skill-fixture"}]; return send(null); }
    return send(skills);
  }
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
    return send(req.headers.accept?.includes("vnd.pgrst.object") ? child : child ? [child] : []);
  }
  if (url.pathname.startsWith("/rest/v1/")) return send([]);
  send({ ok: true });
});
server.listen(54321, "127.0.0.1", () =>
  console.log("Local fixture service ready"),
);
