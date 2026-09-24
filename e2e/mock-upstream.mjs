// Stateful stand-in for https://mulearn.org/api/v1/drugfreekerala/ used by
// the e2e suite. Mirrors the real API's shapes, including its quirks
// (HTTP 200 for "not found", existing record returned on duplicate email).
import { createServer } from "node:http";

const port = Number(process.env.MOCK_UPSTREAM_PORT ?? 4010);
const TOTAL = 5886;

const pledges = new Map([
  ["existing@example.com", { id: 7, name: "Existing Person", email: "existing@example.com" }],
]);
let nextId = 42;

const send = (response, status, body) => {
  response.writeHead(status, { "Content-Type": "application/json" });
  response.end(JSON.stringify(body));
};

createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://127.0.0.1:${port}`);

  if (request.method === "GET" && url.pathname === "/total/") {
    return send(response, 200, { total: TOTAL });
  }

  if (request.method === "POST" && url.pathname === "/create/") {
    let raw = "";
    for await (const chunk of request) raw += chunk;
    const { name, email } = JSON.parse(raw);
    const existing = pledges.get(email);
    if (existing) return send(response, 200, { ...existing, is_error: true });
    const record = { id: nextId++, name, email };
    pledges.set(email, record);
    return send(response, 200, record);
  }

  if (request.method === "GET" && url.pathname === "/get/") {
    const record = pledges.get(url.searchParams.get("email") ?? "");
    return send(response, 200, record ?? { message: "User not found", is_error: true });
  }

  return send(response, 404, { detail: "Not Found" });
}).listen(port, "127.0.0.1", () => {
  process.stdout.write(`mock µLearn API listening on http://127.0.0.1:${port}\n`);
});
