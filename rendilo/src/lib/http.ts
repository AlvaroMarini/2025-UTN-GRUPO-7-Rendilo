export async function jsonFetch<T>(
  url: string,
  init?: RequestInit & { parseAs?: "json" | "text" }
): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    // same-origin cookies (NextAuth) incluidas
    credentials: "same-origin",
  });

  // Permitir leer errores del servidor con JSON estructurado:
  const parseAs = init?.parseAs ?? "json";
  const text = await res.text();
  const data = parseAs === "json" && text ? JSON.parse(text) : (text as any);

  if (!res.ok) {
    const detail = (data && (data.detail ?? data.message)) || text || "Error";
    throw new Error(
      `[${res.status}] ${data?.title ?? "Request failed"}: ${typeof detail === "string" ? detail : JSON.stringify(detail)}`
    );
  }
  return data as T;
}
