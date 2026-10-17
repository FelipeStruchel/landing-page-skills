import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const aqui = path.dirname(new URL(import.meta.url).pathname);
const arq = (n, o) => { const f = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "d-")), n); fs.writeFileSync(f, JSON.stringify(o)); return f; };
const casos = [{ id: "D01", frase: "a", esperada: "x" }, { id: "D02", frase: "b", esperada: "nenhuma" }];

test("tudo certo → 0; um erro → 1 e mostra qual", () => {
  const ok = spawnSync("node", [path.join(aqui, "pontuar-disparo.mjs"), arq("c.json", casos), arq("r.json", { D01: "x", D02: "nenhuma" })], { encoding: "utf8" });
  assert.equal(ok.status, 0);
  const ruim = spawnSync("node", [path.join(aqui, "pontuar-disparo.mjs"), arq("c.json", casos), arq("r.json", { D01: "y" })], { encoding: "utf8" });
  assert.equal(ruim.status, 1);
  assert.match(ruim.stderr, /D01.*esperado x/);
  assert.match(ruim.stderr, /D02.*sem resposta/);
});
