import { it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
function files(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = path.join(dir, n);
    return statSync(p).isDirectory() ? files(p) : [p];
  });
}
it("module graph has no cycles and engines never import UI", () => {
  const graph = new Map<string, Set<string>>();
  for (const file of files("src/modules").filter((f) => f.endsWith(".ts"))) {
    const moduleName = file.split("/")[2];
    if (!graph.has(moduleName)) graph.set(moduleName, new Set());
    const source = readFileSync(file, "utf8");
    expect(source).not.toMatch(/from ['"](@\/components|@\/app|react)/);
    for (const match of source.matchAll(/from ['"]@\/modules\/([^/'"]+)/g)) {
      if (match[1] !== moduleName) graph.get(moduleName)!.add(match[1]);
    }
  }
  const active = new Set<string>(),
    seen = new Set<string>();
  function visit(m: string) {
    expect(active.has(m), `dependency cycle at ${m}`).toBe(false);
    if (seen.has(m)) return;
    active.add(m);
    for (const n of graph.get(m) ?? []) visit(n);
    active.delete(m);
    seen.add(m);
  }
  for (const m of graph.keys()) visit(m);
});
it("client source never imports private bank", () => {
  for (const file of files("src/components"))
    expect(readFileSync(file, "utf8")).not.toMatch(
      /from ['"](@\/data\/problems|@\/modules\/question-bank\/server)/,
    );
  expect(readFileSync("src/modules/question-bank/server.ts", "utf8")).toMatch(
    /import ['"]server-only['"]/,
  );
});
