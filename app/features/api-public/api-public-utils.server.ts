const apiTokens = process.env["PUBLIC_API_TOKENS"]?.split(",") ?? [];
export function requireBearerAuth(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    throw new Response("Missing Authorization header", { status: 401 });
  }
  const token = authHeader.replace("Bearer ", "");
  if (!apiTokens.includes(token)) {
    throw new Response("Invalid token", { status: 401 });
  }
}
