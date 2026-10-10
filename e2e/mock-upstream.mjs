// Stateful stand-in for https://mulearn.org/api/v1/drugfreekerala/ (and the
// college list from https://mulearn.org/api/v1/register/) used by the e2e
// suite. Mirrors the real APIs' shapes, including their quirks (HTTP 200 for
// "not found", existing record returned on duplicate email, 422 for college
// fields create/ rejects).
import { createServer } from "node:http";

const port = Number(process.env.MOCK_UPSTREAM_PORT ?? 4010);
const TOTAL = 5886;

// Unsorted, like the real list; the app sorts it.
const COLLEGES = [
  { id: "02488535-1599-459f-adab-f3ef8fee2281", title: "GOVERNMENT COLLEGE NEDUMANGAD" },
  { id: "5d6c1f0e-7b8a-4c9d-9e0f-1a2b3c4d5e6f", title: "ST THOMAS COLLEGE RANNY" },
  { id: "9b3f1c2e-4d5a-4b6c-8d7e-0f1a2b3c4d5e", title: "GOVERNMENT POLYTECHNIC COLLEGE NEDUMANGAD" },
  { id: "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d", title: "GOVT.ITI VAYALAR" },
];

const pledges = new Map([
  ["existing@example.com", { id: 7, name: "Existing Person", email: "existing@example.com", is_student: null }],
]);
let nextId = 42;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The college rules of the backend's CreateUserDataRequest; null when valid. */
function collegeError({ is_student, college_id, college_name }) {
  const name = typeof college_name === "string" ? college_name.trim() : college_name;
  if (college_id != null && !UUID.test(college_id)) return "college_id is not a UUID";
  if (name != null && (typeof name !== "string" || name.length < 2 || name.length > 255)) {
    return "college_name must be 2-255 characters";
  }
  if (is_student === true) return name == null ? "college_name is required when is_student is true" : null;
  return college_id != null || name != null ? "college fields are only allowed when is_student is true" : null;
}

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
    const body = JSON.parse(raw);
    const error = collegeError(body);
    if (error) return send(response, 422, { detail: [{ msg: `Value error, ${error}` }] });

    const { name, email } = body;
    const existing = pledges.get(email);
    if (existing) return send(response, 200, { message: "User already exists", is_error: true, id: existing.id, name: existing.name, email });
    const record = {
      id: nextId++,
      name,
      email,
      is_student: body.is_student ?? null,
      college_id: body.college_id ?? null,
      college_name: body.college_name?.trim() ?? null,
    };
    pledges.set(email, record);
    // Like the real API, college is stored but never returned.
    return send(response, 200, { message: "User created", id: record.id, name, email });
  }

  if (request.method === "GET" && url.pathname === "/get/") {
    const record = pledges.get(url.searchParams.get("email") ?? "");
    return send(response, 200, record ? { id: record.id, name: record.name, email: record.email } : { message: "User not found", is_error: true });
  }

  if (request.method === "GET" && url.pathname === "/register/colleges/") {
    return send(response, 200, { hasError: false, statusCode: 200, message: { general: [] }, response: { colleges: COLLEGES } });
  }

  // Test-only: what create/ stored, so specs can check what reached the API.
  if (request.method === "GET" && url.pathname === "/__pledges/") {
    const record = pledges.get(url.searchParams.get("email") ?? "");
    return record ? send(response, 200, record) : send(response, 404, { detail: "Not Found" });
  }

  return send(response, 404, { detail: "Not Found" });
}).listen(port, "127.0.0.1", () => {
  process.stdout.write(`mock µLearn API listening on http://127.0.0.1:${port}\n`);
});
