export async function readJson(request: Request): Promise<unknown> {
  if (!request.headers.get("content-type")?.includes("application/json"))
    throw new Error("JSON 요청이 필요합니다.");
  // Stream limit also covers chunked bodies without Content-Length.
  const reader = request.body?.getReader();
  if (!reader) throw new Error("요청 본문이 없습니다.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 4096) {
      await reader.cancel();
      throw new RangeError("요청이 너무 큽니다.");
    }
    chunks.push(value);
  }
  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.length;
  }
  return JSON.parse(new TextDecoder().decode(body));
}
export const noStore = { "Cache-Control": "no-store" };
export function badRequest(error: unknown) {
  return Response.json(
    {
      error:
        error instanceof RangeError
          ? "요청이 너무 큽니다."
          : "답안 형식과 전체 문항 응답 여부를 확인해 주세요.",
    },
    { status: error instanceof RangeError ? 413 : 400, headers: noStore },
  );
}
